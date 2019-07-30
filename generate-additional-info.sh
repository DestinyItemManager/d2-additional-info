 #!/bin/bash
 if [ "$#" -eq  "0" ]
    then
        node getD2Manifest &&
        node generate-season-info &&
        node generate-season-to-source &&
        node generate-source-info &&
        node generate-event-info &&
        node generate-ghost-data &&
        node generate-objective-to-triumph &&
        node generate-bounty-data &&
        yarn pretty
else
    node generate-season-info &&
    node generate-season-to-source &&
    node generate-source-info &&
    node generate-event-info &&
    node generate-ghost-data &&
    node generate-objective-to-triumph &&
    node generate-bounty-data &&
    yarn pretty
fi