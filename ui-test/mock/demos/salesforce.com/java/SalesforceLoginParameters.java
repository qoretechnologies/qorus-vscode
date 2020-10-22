
import java.net.URL;
import java.net.MalformedURLException;

import com.salesforce.emp.connector.BayeuxParameters;

public class SalesforceLoginParameters implements BayeuxParameters {
    private String token;
    private URL url;

    public SalesforceLoginParameters(String token, String url) {
        this.token = token;
        try {
            this.url = new URL(url);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException(String.format("Unable to create url: %s", url), e);
        }
    }

    public String bearerToken() {
        return token;
    }

    public URL getUrl() {
        return url;
    }

    @Override
    public URL host() {
        return url;
    }

    @Override
    public URL endpoint() {
        return endpoint;
    }
}
