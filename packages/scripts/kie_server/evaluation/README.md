Mortages Robot
--

This script is used to create process instances for mortages process when using Kie Server dashboards.

### Requirements

Install jbang, Kie Server running on port 8280 and user `kieserver` on Kie Server with the appropriated roles:

```
./bin/add-user.sh  -a -u 'kieserver' -p 'kieserver1!' -g 'kie-server,admin,approver,manager,broker'
```

### Running

Use `jbang MortgagesRobot.java`

### Developing

If you want to modify the code you may want to use VSCode and jbang:

~~~
jbang edit --open=code MortgagesRobot.java
~~~

