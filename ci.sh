git config --global user.email "31990469+sundevour@users.noreply.github.com"
git config --global user.name "sundevour"

# Decrypt SSH key
openssl aes-256-cbc -K $encrypted_key -iv $encrypted_iv -in id_rsa.enc -out ~/.ssh/github.rsa -d
chmod 600 ~/.ssh/github.rsa
echo -e "Host github.com\n\tHostName github.com\n\tUser git\n\tIdentityFile ~/.ssh/github.rsa\n" >> ~/.ssh/config

# Clone project
git clone git@github.com:sundevour/d2-additional-info.git --depth 1
cd d2-additional-info
yarn install

# fetch and process the english manifest
bash generate-additional-info.sh

# we're done if there are no changes
if [ ! "$(git status --porcelain)" ]
    then echo no change
    exit 0
fi

# informational git status dump
echo /=== begin changes after generate-additional-info.sh
git status --porcelain
echo end changes after generate-additional-info.sh ===/

# make a commit
if [ "$MANIFEST_VERSION" ]
    then commitmsg="update all - manifest v$MANIFEST_VERSION"
        dimcommitmsg="update configs - manifest v$MANIFEST_VERSION"
        branchname="$MANIFEST_VERSION"
    else commitmsg="update all - repo changed - $TRAVIS_COMMIT"
        dimcommitmsg="update configs - d2ai rules changed - $TRAVIS_COMMIT"
        branchname="d2ai-config-update-$TRAVIS_COMMIT"
fi

# if we reached here, there's something to send to github
# first we PR back to our own repo
git checkout -b $branchname
git add -u
git commit -m "$commitmsg"
git push origin $branchname
hub pull-request -r sundevour,delphiactual -m "d2ai automated build update" -m "$commitmsg"

# then we clone DIM, and add our new files
cd ..
git clone git@github.com:sundevour/DIM --depth 1
cd DIM
cp -f ../d2-additional-info/output/*.json ./src/data/d2/

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
git add -u
git commit -m "$dimcommitmsg"
git push origin $branchname
hub pull-request -r sundevour,delphiactual -m "d2ai automated config update" -m "$dimcommitmsg"
exit 0
