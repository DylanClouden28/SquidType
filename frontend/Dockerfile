FROM node:21


ENV HOME  /root

WORKDIR /root/

COPY . .

RUN npm install
RUN npm run build

EXPOSE 8080

CMD npm run preview
