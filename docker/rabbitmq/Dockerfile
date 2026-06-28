FROM rabbitmq:3.13-management

# Cài đặt wget để tải plugin
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Tải plugin rabbitmq_delayed_message_exchange tương thích với RabbitMQ 3.13
RUN wget -P /plugins/ https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/v3.13.0/rabbitmq_delayed_message_exchange-3.13.0.ez

# Kích hoạt plugin
RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange
