using {IMAPConfiguration as IC} from '../db/schema';

service MailReader {
    // entity Organization as projection on IC.Organization;
    // entity Administrator as projection on IC.Administrator;
    entity EmailConfiguration as projection on IC.EmailConfiguration;
    entity EmailData            as projection on IC.EmailData;
    entity Attachments        as projection on IC.Attachments;

    @cds.persistence.skip: true
    entity SelectedMail {
        key useremail : String  @Core.Computed: false;
            password  : String  @Core.Computed: false;
            protocol  : String  @Core.Computed: false;
            host      : String  @Core.Computed: false;
            port      : Integer @Core.Computed: false;
            tls       : Boolean @Core.Computed: false;
    }
}
