FROM node:18-alpine

RUN apk add --no-cache python3 py3-pip git

WORKDIR /app

COPY . .

RUN git submodule update --init --recursive

RUN pip install -r requirements.txt

RUN npm install

RUN cd client && npm install && cd ..

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
