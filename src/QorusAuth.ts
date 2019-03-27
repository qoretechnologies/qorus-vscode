export enum AuthNeeded {Yes = 1, No, Unknown}

export class QorusAuth {

    protected auth_needed: any = {};
    protected tokens: any = {};
    protected active_url: string | undefined = undefined;

    getToken(url: string | undefined = this.active_url): string | undefined {
        return this.tokens[url];
    }

    addToken(url: string, token: string, set_active: boolean = true) {
        this.auth_needed[url] = AuthNeeded.Yes;
        this.tokens[url] = token;
        if (set_active) {
            this.active_url = url;
        }
    }

    deleteToken(url: string) {
        delete this.tokens[url];
        if (url === this.active_url) {
            this.active_url = undefined;
        }
    }

    addNoAuth(url: string, set_active: boolean = true) {
        this.auth_needed[url] = AuthNeeded.No;
        if (set_active) {
            this.active_url = url;
        }
    }

    forgetAllInfo(url: string) {
        this.deleteToken(url);
        delete this.auth_needed[url];
    }

    setActive(url: string) {
        this.active_url = url;
    }

    unsetActive() {
        this.active_url = undefined;
    }

    isActive(url: string): boolean {
        return url === this.active_url;
    }

    isLoggedIn(url: string): boolean {
        return !!this.tokens[url];
    }

    authNeeded(url: string | undefined = this.active_url): AuthNeeded {
        if (!this.auth_needed[url]) {
            return AuthNeeded.Unknown;
        }
        return this.auth_needed[url];
    }

    isAuthorized(url: string): boolean {
        return this.auth_needed[url] === AuthNeeded.No || this.isLoggedIn(url);
    }
}
