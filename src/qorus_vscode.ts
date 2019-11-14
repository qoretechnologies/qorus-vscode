import { ExtensionContext } from 'vscode';
import { t } from 'ttag';
import * as msg from './qorus_message';

class QorusExtension {
    private extension_context: ExtensionContext;

    get context(): ExtensionContext {
        return this.extension_context;
    }

    set context(context: ExtensionContext) {
        this.extension_context = context;
    }

    waitForContext(): Promise<void> {
        const timeout = 5000;
        const interval = 10;
        let n = timeout / interval;
        let interval_id: any;

        return new Promise((resolve, reject) => {
            const checkPending = () => {
                if (!this.extension_context && --n) {
                    return;
                }
                clearInterval(interval_id);
                if (n > 0) {
                    resolve();
                } else {
                    const error = t`GettingExtensionContextTimedOut`;
                    msg.error(error);
                    reject(error);
                }
            };

            interval_id = setInterval(checkPending, interval);
        });
    }
}

export const qorus_vscode = new QorusExtension();
