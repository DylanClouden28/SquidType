FROM node:21


ENV HOME  /root

WORKDIR /root/

COPY . .

RUN npm install
RUN npm run build

EXPOSE 4173

CMD npm run preview -- --host
