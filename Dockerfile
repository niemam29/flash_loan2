FROM node:16

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone https://github.com/niemam29/flash_loan2.git .

RUN npm install

RUN npx hardhat compile

CMD [ "bash" ]
