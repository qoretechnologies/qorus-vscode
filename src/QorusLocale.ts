import { workspace } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as gettext_parser from 'gettext-parser';
import { t, addLocale, useLocale } from 'ttag';
import * as msg from './qorus_message';

class QorusLocale {
    private translation_object: any = undefined;

    get translations(): any {
        return this.translation_object
            && this.translation_object.translations
            && this.translation_object.translations[''];
    }

    setLocale = () => {
        const default_locale = 'en';
        let use_default_locale: boolean = false;

        let po_file: string | undefined = undefined;
        let locale: string = workspace.getConfiguration().typescript.locale;

        const setPoFile = () => {
            if (use_default_locale) {
                locale = default_locale;
            }
            po_file = path.join(__dirname, '..', 'lang', `${locale}.po`);
            if (!fs.existsSync(po_file)) {
                po_file = undefined;
            }
        }

        if (locale) {
            setPoFile();
            if (!po_file && locale != default_locale) {
                use_default_locale = true;
                setPoFile();
            }
        } else {
            use_default_locale = true;
                setPoFile();
        }

        if (!po_file) {
            msg.error('Language file not found');
            return undefined;
        }

        this.translation_object = gettext_parser.po.parse(fs.readFileSync(po_file));
        addLocale(locale, this.translation_object);
        useLocale(locale);

        if (use_default_locale) {
            msg.log(t`UsingDefaultLocale ${locale}`);
        } else {
            msg.log(t`UsingLocaleSettings ${locale}`);
        }
    }
}

export const qorus_locale = new QorusLocale();
