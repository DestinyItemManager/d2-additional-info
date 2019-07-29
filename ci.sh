git config --global user.email "destinyitemmanager@gmail.com"
git config --global user.name "DIM Config Bot"

# Decrypt SSH key
openssl aes-256-cbc -K $encrypted_f14bdd40febd_key -iv $encrypted_f14bdd40febd_iv -in id_rsa.enc -out ~/.ssh/dim_travis.rsa -d
chmod 600 ~/.ssh/dim_travis.rsa
echo -e "Host github.com\n\tHostName github.com\n\tUser git\n\tIdentityFile ~/.ssh/dim_travis.rsa\n" >> ~/.ssh/config

# Clone project
git clone git@github.com:DestinyItemManager/d2-additional-info.git --depth 1
cd d2-additional-info
yarn install

# fetch and process the english manifest
bash generate-additional-info.sh

# informational git status dump
echo /=== begin changes after generate-additional-info.sh
git status --porcelain
echo end changes after generate-additional-info.sh ===/

# make commit messages
if [ "$MANIFEST_VERSION" ]
    then commitmsg="update all - manifest v$MANIFEST_VERSION"
        dimcommitmsg="update configs - manifest v$MANIFEST_VERSION"
        branchname="$MANIFEST_VERSION"
    else commitmsg="update all - repo changed - $TRAVIS_COMMIT"
        dimcommitmsg="update configs - d2ai rules changed - $TRAVIS_COMMIT"
        branchname="d2ai-config-update-$TRAVIS_COMMIT"
fi

if [ ! "$(git status --porcelain)" ]
    then echo no change in d2ai repo

    # if we reached here, there's something to send to github
    # first we PR back to our own repo
    else git checkout -b $branchname
        git add -A
        git commit -m "$commitmsg"
        hub pull-request -p -r sundevour,delphiactual -m "d2ai automated build update" -m "$commitmsg"
fi

# continue on to check for changes from current dim configs
# we clone DIM, and add our new files
cd ..
git clone git@github.com:DestinyItemManager/DIM --depth 1
cd DIM
find src/data/d2/* -delete
cp -f ../d2-additional-info/output/* ./src/data/d2/

echo /=== begin changes from existing d2-additional-info-module
git status --porcelain
echo end changes from existing d2-additional-info-module ===/

# in case there are no changes, we're done
if [ ! "$(git status --porcelain)" ]
    then echo no change from existing DIM
    exit 0
fi

# in case there are more changes than the intended folder, something went really wrong here
if [ "$(git status --porcelain|grep -v src/data/d2)" ]
    then echo non-config files changed in DIM
    exit 1
fi

# create a DIM branch and make a PR
echo making a PR
git checkout -b $branchname
git add -A
git commit -m "$dimcommitmsg"
hub pull-request -p -r sundevour,delphiactual -m "d2ai automated config update" -m "$dimcommitmsg"
exit 0
