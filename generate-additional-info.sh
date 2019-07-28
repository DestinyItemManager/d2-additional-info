 #!/bin/bash
 if [ "$#" -eq  "0" ]
    then
        node getD2Manifest &&
        node generate-season-event-info &&
        node generate-season-to-source &&
        node generate-source-info &&
        node generate-ghost-data &&
        node generate-objective-to-triumph &&
        yarn pretty
else
    node generate-season-event-info &&
    node generate-season-to-source &&
    node generate-source-info &&
    node generate-ghost-data &&
    node generate-objective-to-triumph &&
    yarn pretty
fi