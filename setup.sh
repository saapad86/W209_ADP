sudo yum install git
git clone https://github.com/saapad86/W209_ADP.git
sudo yum install -y nginx
sudo yum install -y gcc-c++
sudo yum install -y libxml2-python libxml2-devel
sudo yum install -y python-devel
sudo easy_install uwsgi
sudo easy_install Flask
# -- Some edits to /etc/nginx/nginx.conf
# location / {
#     include uwsgi_params;
#     uwsgi_pass 127.0.0.1:10080;
# }
sudo service nginx start
sudo chkconfig nginx on