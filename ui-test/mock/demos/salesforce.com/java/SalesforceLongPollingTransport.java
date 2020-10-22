
import java.util.Map;

import org.cometd.client.transport.LongPollingTransport;
import org.eclipse.jetty.client.ContentExchange;

public class SalesforceLongPollingTransport extends LongPollingTransport {
   private String sessionId;

    public SalesforceLongPollingTransport(Map<String,Object> options, org.eclipse.jetty.client.HttpClient httpClient, String sid) {
        super(options, httpClient);
        sessionId = sid;
    }

    protected void customize(ContentExchange exchange) {
        super.customize(exchange);
        exchange.addRequestHeader("Authorization", "OAuth " + sessionId);
    }
}
