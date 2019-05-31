FROM node:10.16.0-stretch

WORKDIR "/app"

RUN apt-get update && apt-get -y install libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev g++ libsass-dev
RUN npm install --global gulp

CMD ["gulp", "default", "watch"]
