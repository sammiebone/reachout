FROM node:18-alpine

RUN apk add --no-cache python3 py3-pip git

WORKDIR /app

COPY . .

RUN pip install --break-system-packages -r requirements.txt

RUN npm install

RUN cd client && npm install && cd ..

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
