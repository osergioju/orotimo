# Use uma imagem base do Python
FROM python:3.11.7

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /mathwork

# Copie o arquivo requirements.txt e instale as dependências
COPY requirements.txt .

# Instale as dependências do Python
RUN pip install -r requirements.txt

# Copie todo o conteúdo do diretório atual para o diretório de trabalho no contêiner
COPY . .

# Defina a variável de ambiente para o Django
ENV DJANGO_SETTINGS_MODULE=mathwork.settings

# Execute o comando para coletar os arquivos estáticos do Django
RUN python manage.py collectstatic --noinput

# Expõe a porta 8000 para fora do contêiner
EXPOSE 8000

# Comando para iniciar o servidor Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]