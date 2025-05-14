chmod 777 /usr/src/app/frontend/script/setupstatic.sh && sh -c /usr/src/app/frontend/script/setupstatic.sh
cd /usr/src/app/frontend/ && npx tsc && npx tailwindcss -i ./public/style/input.css -o ./public/style/output.css
nginx -g "daemon off;"