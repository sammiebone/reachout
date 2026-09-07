FROM node:18-alpine

RUN apk add --no-cache python3 py3-pip git

WORKDIR /app

COPY . .

RUN git clone https://github.com/farukalpay/SMS-Sender.git SMS-Sender || true

RUN pip install --break-system-packages -r requirements.txt

RUN if [ -f SMS-Sender/requirements.txt ]; then sed -i '/^random==/d; /^string==/d' SMS-Sender/requirements.txt && pip install --break-system-packages -r SMS-Sender/requirements.txt; fi

RUN npm install

RUN cd client && npm install && cd ..

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
