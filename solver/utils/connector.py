from pymysql import connect, Error
from dotenv import load_dotenv
from os import getenv

class Connector:

    def __init__(self) -> None:
        load_dotenv("cronogrid.env", override=True)
        self.DB_HOST = getenv("DB_HOST")
        self.DB_USER = getenv("DB_USER")
        self.DB_PASS = getenv("DB_PASS")
        self.DB_NAME = getenv("DB_NAME")

        try:
            # Conectar ao banco de dados
            self.connection = connect(host=self.DB_HOST, user=self.DB_USER, password=self.DB_PASS, database=self.DB_NAME)
            print("Conexão ao banco de dados realizada com sucesso!")
        except Error as e:
            print(f"Erro: {e}")

    def executar_query(self, query):
            
        with self.connection.cursor() as cursor:
            # Execute suas operações no banco de dados aqui
            cursor.execute(query)
            resultados = cursor.fetchall()

        return resultados
    
    def fechar_conexao(self):
        self.connection.close()
    
    def get_nm_escola(self, id_escola):
        query = f"SELECT Nome_Escola FROM Escolas WHERE Id_Escola = {id_escola}"
        return self.executar_query(query)[0]

    def get_nm_unidade(self, id_unidade):
        query = f"SELECT Nome_Unidade FROM Unidades WHERE Id_Unidade = {id_unidade}"
        return self.executar_query(query)[0]

    def get_nm_periodo(self, id_periodo):
        query = f"SELECT Nome_Periodo FROM Periodos WHERE Id_Periodo = {id_periodo}"
        return self.executar_query(query)[0]

    def get_configuracao(self, id_configuracao):

        colunas_configuracao = [
            "Id_Configuracao",
            "Id_Escola",
            "Id_Unidade",
            "Id_Periodo",
            "Desc_Configuracao",
            "Momento_Execucao"
        ]

        query = f"SELECT {', '.join(colunas_configuracao)} FROM Configuracoes WHERE Id_Configuracao = {id_configuracao}"
        return {key: value for key, value in zip(colunas_configuracao, self.executar_query(query)[0])}