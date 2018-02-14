FROM 370531249777.dkr.ecr.ap-south-1.amazonaws.com/ubuntu:16.04

# Install essentials
RUN apt-get update && \
	apt-get install -y \
		curl \
		build-essential \
		ca-certificates \
		gcc \
		git \
		libpq-dev \
		make \
		python-pip \
		python2.7 \
		python2.7-dev \
		ssh

# Install nginx
RUN apt-get install -y nginx

# Install node and pm2
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && \
	apt-get install -y nodejs && \
	npm install pm2 -g && \
	pm2 update

# For node optimisation
ENV NODE_ENV=production

# Cleanup
RUN apt-get autoremove
RUN apt-get clean

# Environment variables
ENV SERVICE_PORT 8085

# Copying nginx config
COPY nginx/service.nginx.conf /etc/nginx/servers/ecs-service
COPY nginx/container.nginx.conf /etc/nginx/nginx.conf

# Copying pm2 config
COPY pm2/process.yml process.yml

# Copying node application files
COPY package.json .
COPY package-lock.json .
COPY src src
COPY server.js .
COPY start.sh .

# Installing node dependencies
RUN npm install
EXPOSE 80
