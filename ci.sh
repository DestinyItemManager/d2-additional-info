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
echo status begin
git status --porcelain
echo status end

# we're done if there are no changes
if [ ! "$(git status --porcelain)" ]; then echo no change; exit 0; fi

# abort if build caused a change besides the output folder
if [ "$(git status --porcelain|grep -v output)" ]; then echo non-output change found; exit 1; fi


# if we reached here, there's something to send to github
cd ..
git clone git@github.com:sundevour/d2-additional-info-module.git --depth 1
cd d2-additional-info-module
cp -f ../d2-additional-info/output/*.json ./

# make a commit
if [ "$MANIFEST_VERSION" ]
    then commitmsg="update output - manifest v$MANIFEST_VERSION"
        branchname="$MANIFEST_VERSION"
    else commitmsg="update output - repo changed"
        branchname="d2ai-config-update"
fi

git checkout -b $branchname
git add -u
git commit -m "$commitmsg"

git status --porcelain|grep -e objective-triumph -e source-info -e inventoryitem-relationships

# if there was a strings-generated change, create a PR
if [ "$(git status --porcelain|grep -e objective-triumph -e source-info -e inventoryitem-relationships)" ]
    then echo making a PR
        git push origin $branchname
        exit 0
# changed files are dependable, push directly
    else echo merging
        git push origin master
        exit 0
fi
