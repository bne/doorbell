. /etc/environment
export VENV_BIN=`pwd`/venv/bin
export PATH=$VENV_BIN:$PATH
export PROJECT_ROOT=`pwd`
export SETTINGS=$PROJECT_ROOT/src/settings.py

case "$1" in
    start)
    echo "Starting server"
    # Start the daemon 
    $VENV_BIN/python $PROJECT_ROOT/src/daemon/ddoorbell start
    ;;
stop)
    echo "Stopping server"
    # Stop the daemon
    $VENV_BIN/python $PROJECT_ROOT/src/daemon/ddoorbell stop
    ;;
*)
    # Refuse to do other stuff
    echo "HELLO"
    exit 1
    ;;
esac

exit 0