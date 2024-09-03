const cds = require('@sap/cds');
const Imap = require('imap');
const { v4: uuidv4 } = require('uuid');
const inspect = require('util').inspect;

module.exports = cds.service.impl(function () {
    const { EmailConfiguration, EmailData, Attachments } = this.entities;

    this.after('CREATE', async (req) => {
        const imap = new Imap({
            user: req.useremail,
            password: req.password,
            host: req.host,
            port: req.port,
            tls: true
        });

        process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

        function openInbox(cb) {
            imap.openBox('INBOX', true, cb);
        }

        imap.once('ready', function () {
            openInbox(async function (err, box) {
                if (err) throw err;

                const totalMessages = box.messages.total;
                const start = Math.max(totalMessages - 99, 1); // Fetch the latest 100 messages
                const end = totalMessages;

                const f = imap.seq.fetch(`${start}:${end}`, {
                    bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)'],
                    struct: true,
                });

                f.on('message', async function (msg, seqno) {
                    console.log('Message #%d', seqno);
                    const prefix = '(#' + seqno + ') ';

                    let emailHeader;
                    let attrs; // To store message attributes
                    let emailId; // To store email ID for updates
                    let attachments = []; // Array to store attachments

                    msg.on('body', function (stream, info) {
                        let buffer = '';
                        stream.on('data', function (chunk) {
                            buffer += chunk.toString('utf8');
                        });
                        stream.once('end', async function () {
                            if (info.which === 'HEADER.FIELDS (FROM TO SUBJECT DATE)') {
                                try {
                                    const header = Imap.parseHeader(buffer);
                                    console.log(prefix + 'Parsed header: %s', inspect(header));

                                    const getHeaderValue = (headerArray) => headerArray && headerArray.length > 0 ? headerArray[0].trim() : '';

                                    const from = sanitizeString(getHeaderValue(header.from));
                                    const to = getHeaderValue(header.to).split(',').map(email => sanitizeString(email.trim())); // Convert to array
                                    const dateStr = sanitizeString(getHeaderValue(header.date));
                                    const subject = sanitizeString(getHeaderValue(header.subject));

                                    let emailDate, emailTime;
                                    try {
                                        const dateTime = new Date(dateStr);
                                        if (isNaN(dateTime.getTime())) {
                                            throw new Error('Invalid date');
                                        }
                                        emailDate = dateTime.toISOString().split('T')[0];
                                        emailTime = dateTime.toTimeString().split(' ')[0];
                                    } catch (e) {
                                        console.log('Error parsing date:', e);
                                        emailDate = null;
                                        emailTime = null;
                                    }

                                    const emailData = {
                                        Id: uuidv4(),
                                        date: emailDate ? utf8Encode(emailDate) : null,
                                        time: emailTime ? utf8Encode(emailTime) : null,
                                        subject: subject,
                                        sender: from,
                                        receiver: to.join(','), // Convert array to comma-separated string
                                        noOfAttachments: 0 // Will update after processing attachments
                                    };
                                    console.log('Email data:', emailData);

                                    try {
                                        const result = await cds.run(INSERT.into(EmailData).entries(emailData));
                                        emailId = result.Id; // Update to use the correct Id field
                                    } catch (error) {
                                        console.log('Error inserting email data:', error);
                                        console.log('Email data:', emailData);
                                        return;
                                    }
                                } catch (error) {
                                    console.log('Error processing email body:', error);
                                }
                            }
                        });
                    });

                    msg.once('attributes', function (messageAttrs) {
                        console.log(prefix + 'Attributes: %s', inspect(messageAttrs, false, 8));
                        attrs = messageAttrs; // Save attrs for later use
                    });

                    msg.once('end', async function () {
                        console.log(prefix + 'Finished');
                        await processAttachments(emailId, attrs);
                    });
                });

                f.once('error', function (err) {
                    console.log('Fetch error: ' + err);
                });

                f.once('end', function () {
                    console.log('Done fetching all messages!');
                    imap.end();
                });
            });
        });

        imap.once('error', function (err) {
            console.log(err);
        });

        imap.once('end', function () {
            console.log('Connection ended');
        });

        imap.connect();

        async function processAttachments(emailId, messageAttrs) {
            if (!messageAttrs || !messageAttrs.struct) {
                console.log('No attachments to process.');
                // Update emailData with attachment count
                await cds.run(UPDATE(EmailData).set({ noOfAttachments: 0 }).where({ Id: emailId }));
                return;
            }

            const parts = messageAttrs.struct; // Get parts from messageAttrs
            let attachments = []; // Ensure attachments array is properly scoped
            parseParts(parts, attachments);

            // Update the count of attachments
            const noOfAttachments = attachments.length;
            await cds.run(UPDATE(EmailData).set({ noOfAttachments: noOfAttachments }).where({ Id: emailId }));

            for (const attachment of attachments) {
                const fetch = imap.fetch(messageAttrs.uid, { bodies: [attachment.partID], struct: true });
                fetch.on('message', function (msg) {
                    msg.on('body', async function (stream) {
                        let data = [];
                        stream.on('data', chunk => data.push(chunk));
                        stream.once('end', async function () {
                            try {
                                const buffer = Buffer.concat(data);
                                const base64Data = buffer.toString('base64');

                                const attachmentData = {
                                    Id: uuidv4(),
                                    email: { ID: emailId }, // Set association
                                    fileName: attachment.filename ? utf8Encode(attachment.filename) : null,
                                    fileType: attachment.fileType || 'application/octet-stream', // Default MIME type
                                    file: base64Data, // Store as base64
                                    size: buffer.length, // Store size of the attachment
                                    encoding: attachment.encoding || 'base64' // Default encoding
                                };

                                try {
                                    await cds.run(INSERT.into(Attachments).entries(attachmentData));
                                } catch (error) {
                                    console.log('Error inserting attachment data:', error);
                                }
                            } catch (error) {
                                console.log('Error processing attachment:', error);
                            }
                        });
                    });
                });

                fetch.once('error', function (err) {
                    console.log('Fetch error: ' + err);
                });

                fetch.once('end', function () {
                    console.log('Done fetching attachment!');
                });
            }
        }

        function utf8Encode(str) {
            return str ? Buffer.from(str, 'utf8').toString('utf8') : '';
        }

        function sanitizeString(str) {
            return str ? str.replace(/[^\x20-\x7E]/g, '') : '';
        }

        function parseParts(parts, attachments) {
            parts.forEach(part => {
                if (Array.isArray(part)) {
                    parseParts(part, attachments);
                } else {
                    if (part.disposition && part.disposition.type === 'ATTACHMENT') {
                        attachments.push({
                            partID: part.partID,
                            filename: part.disposition.params.filename,
                            encoding: part.encoding,
                            fileType: part.type + '/' + part.subtype // MIME type, e.g., 'image/jpeg'
                        });
                    }
                }
            });
        }
    });
});
