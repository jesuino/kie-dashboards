if [ -z ${DASHBUILDER_RUNTIME+x} ];
then
        echo "DASHBUILDER_RUNTIME is not set";
        exit 0;
fi
DIR=`pwd`
MODELS_DIR="$DIR/packages/dashboards"

# Add the following properties to debug
# -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005 \

# Add the following property to create the query on Kie Server
# -Ddashbuilder.kieserver.serverTemplate.sample-server.replace_query=true \
java -jar -Dquarkus.http.port=8180 \
	  -Ddashbuilder.runtime.multi=true \
          -Ddashbuilder.import.base.dir=$MODELS_DIR \
          -Ddashbuilder.dev=true \
          -Ddashbuilder.kieserver.serverTemplate.sample-server.location=http://localhost:8280/kie-server/services/rest/server \
          -Ddashbuilder.kieserver.serverTemplate.sample-server.user=kieserver \
          -Ddashbuilder.kieserver.serverTemplate.sample-server.password=kieserver1! $DASHBUILDER_RUNTIME 
