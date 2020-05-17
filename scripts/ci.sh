porcelain_log()
{
    # informational git status dump
    echo
    echo ================Begin Changes To $1=================
    git status --porcelain
    echo =================End Changes To $1==================
    echo
}

git config --global user.email "destinyitemmanager@gmail.com"
git config --global user.name "DIM Config Bot"

# make commit messages
if [ "$MANIFEST_VERSION" ]
    then 
        commitmsg="update all - manifest v$MANIFEST_VERSION"
        dimcommitmsg="update configs - manifest v$MANIFEST_VERSION"
        branchname="$MANIFEST_VERSION"
    else 
        commitmsg="update all - repo changed - $GITHUB_SHA"
        dimcommitmsg="update configs - d2ai rules changed - $GITHUB_SHA"
        branchname="d2ai-config-update-$GITHUB_SHA"
fi

if [ ! "$(git status --porcelain)" ]
    then 
        echo no change in d2ai 
    elif [ "$GITHUB_EVENT_NAME" = "push" ] 
    then
        porcelain_log "d2ai"
        git checkout -b $branchname
        git add -A
        git commit -m "$commitmsg"
        hub pull-request -p -r sundevour,delphiactual -m "d2ai automated build update" -m "$commitmsg"
    else
        porcelain_log "d2ai"
        echo "Please run 'yarn manifest:get && yarn generate-data' and push that commit next time."
        echo "D2AI bot will attempt to fix it for you now."
        exit 0
fi

if [ "$GITHUB_EVENT_NAME" = "pull_request" ]
    then 
        exit 0
fi

# continue on to check for changes from current dim configs
# we clone DIM, and add our new files
cd ..
hub clone DestinyItemManager/DIM --depth 1
cd DIM
find src/data/d2/* -delete
cp -f ../output/* ./src/data/d2/

porcelain_log "DIM"

# in case there are no changes, we're done
if [ ! "$(git status --porcelain)" ]
    then
        echo no change from existing DIM
        exit 0
fi

# in case there are more changes than the intended folder, something went really wrong here
if [ "$(git status --porcelain|grep -v src/data/d2)" ]
    then 
        echo non-config files changed in DIM
        exit 1
fi

# create a DIM branch and make a PR
echo making a PR
git checkout -b $branchname
git add -A
git commit -m "$dimcommitmsg"
hub pull-request -p -r sundevour,delphiactual -m "d2ai automated config update" -m "$dimcommitmsg"
exit 0