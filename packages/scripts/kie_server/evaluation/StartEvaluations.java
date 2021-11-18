//usr/bin/env jbang "$0" "$@" ; exit $?
//DEPS org.kie.server:kie-server-client:7.60.0.Final org.kie.workbench.playground:evaluation:7.60.0.Final
//JAVA 11

import static org.kie.server.client.KieServicesFactory.newKieServicesClient;
import static org.kie.server.client.KieServicesFactory.newRestConfiguration;

import java.util.HashSet;
import java.util.Map;
import java.util.Random;

import org.kie.server.api.marshalling.MarshallingFormat;
import org.kie.server.api.model.KieContainerResource;
import org.kie.server.api.model.ReleaseId;
import org.kie.server.client.KieServicesClient;
import org.kie.server.client.ProcessServicesClient;

public class StartEvaluations {

    private static final Random random = new Random();

    private static final String URL = "http://localhost:8280/kie-server/services/rest/server";
    private static final String USER = "kieserver";
    private static final String PASSWORD = "kieserver1!";

    private static final String CONTAINER = "evaluation";
    private static final String GROUPID = "org.kie.workbench.playground";
    private static final String ARTIFACTID = "evaluation";
    private static final String VERSION = "7.60.0.Final";

    private static final String PROCESSID = "evaluation";

    private static final String[] USERS = { USER };

    private static final KieServicesClient client;
    private static final ProcessServicesClient processClient;

    static {
        var extraClasses = new HashSet<Class<?>>();
        var conf = newRestConfiguration(URL, USER, PASSWORD);

        conf.addExtraClasses(extraClasses);
        conf.setMarshallingFormat(MarshallingFormat.JSON);

        client = newKieServicesClient(conf);
        processClient = client.getServicesClient(ProcessServicesClient.class);
    }

    public static void main(String[] args) {
        var container = client.getContainerInfo(CONTAINER);
        System.out.println("CONTAINER:" + container.getResult());
        if (container.getResult() == null) {
            var releaseId = new ReleaseId(GROUPID, ARTIFACTID, VERSION);
            var resource = new KieContainerResource(releaseId);
            client.createContainer(CONTAINER, resource);
            System.out
                    .println("Container is being created, run again in a few seconds to start processes instances...");
            System.exit(0);
        }

        for (var user : USERS) {
            var startResult = processClient.startProcess(CONTAINER, PROCESSID,
                Map.of("employee", user, "performance", random.nextInt(10) + 1, "reason", "some random reason"));

	    System.out.println("Started: " + startResult);
        }
    }

}
