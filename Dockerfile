FROM node:alpine


COPY . /app
RUN npm install

CMD ["npm test"]
