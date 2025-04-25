class FunctionsHelper {

    cleanJid (jid) {
        if (!jid) return '';
        if (jid.includes(':')) {
            return jid.split(':')[0] + '@' + jid.split('@')[1];
        }
        return jid;
    }
}
const Functions = new FunctionsHelper();
module.exports = Functions;

