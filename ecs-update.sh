STAGE=$1
if [ "$STAGE" == "" ]
then
  STAGE="devo"
fi

if [ "$STAGE" != "devo" -a "$STAGE" != "gamma" -a "$STAGE" != "prod" ]
then
  echo "Invalid stage!"
  echo "Syntax: bash ecs-update.sh <devo|prod|gamma>"
  exit 0
fi


if [ ! -f "Dockerfile.raw" ]; then
  echo "Could not find Dockerfile.raw !"
  exit 0
fi


WORK_DIR=$(pwd)

if [ -d "../ecs" ]; then
  cd ../ecs && git pull && cd $WORK_DIR
else
  cd .. && git clone https://github.com/Pratilipi/ecs.git && cd $WORK_DIR
fi

bash ../ecs/app.sh update $STAGE pag 0.0.1
