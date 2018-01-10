# start nginx
exec service nginx start &

# start node server
exec npm run-script server
