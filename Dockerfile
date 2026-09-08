FROM node:18-alpine

RUN apk add --no-cache python3 py3-pip git

WORKDIR /app

COPY . .

RUN git clone https://github.com/farukalpay/SMS-Sender.git SMS-Sender || true

RUN pip install --break-system-packages -r requirements.txt

RUN if [ -f SMS-Sender/requirements.txt ]; then grep -v -E '^(random|string|time|itertools|json|re|importlib(\..+)?|sys|os|collections|functools|operator|subprocess|pathlib|typing|concurrent(\..+)?|email(\..+)?|logging|threading|pickle|socket|ssl|hashlib|hmac|base64|csv|xml|html|urllib)=' SMS-Sender/requirements.txt > SMS-Sender/requirements-filtered.txt && pip install --break-system-packages -r SMS-Sender/requirements-filtered.txt; fi

RUN npm install

RUN cd client && npm install && cd ..

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
