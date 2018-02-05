# start nginx
exec service nginx start &

# start node server
exec pm2-runtime process.yml
