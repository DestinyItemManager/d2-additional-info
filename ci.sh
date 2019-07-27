git config --global user.email "31990469+sundevour@users.noreply.github.com"
git config --global user.name "sundevour"

# Decrypt SSH key
openssl aes-256-cbc -K $encrypted_key -iv $encrypted_iv -in id_rsa.enc -out ~/.ssh/github.rsa -d
chmod 600 ~/.ssh/github.rsa
echo -e "Host github.com\n\tHostName github.com\n\tUser git\n\tIdentityFile ~/.ssh/github.rsa\n" >> ~/.ssh/config

# Clone project
git clone git@github.com:sundevour/d2-additional-info.git --depth 1
cd d2-additional-info
git checkout d2ai-plus-ci
yarn install
bash generate-additional-info.sh
git status --porcelain