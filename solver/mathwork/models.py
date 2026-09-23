from django.db import models
from django.contrib.auth.models import AbstractBaseUser

class Escolas(models.Model):
    Id_Escola = models.AutoField(primary_key=True)
    Nome_Escola = models.CharField(max_length=100)
    Modulo_Contratado = models.CharField(max_length=100)
    Dt_Cotratacao = models.CharField(max_length=100)
    Dt_Final_Cotratacao = models.CharField(max_length=100)
    N_Rodadas_Contratadas = models.CharField(max_length=100)
    N_Rodadas_Utilizadas = models.CharField(max_length=100)
    Is_Ativo = models.CharField(max_length=100)

    class Meta:
        db_table = 'Escolas'

class Unidades(models.Model):
    Id_Unidade = models.AutoField(primary_key=True)
    Id_Escola = models.ForeignKey(Escolas, on_delete=models.CASCADE, db_column='Id_Escola')
    Nome_Unidade = models.CharField(max_length=100)
    Is_Ativo = models.CharField(max_length=100)

    class Meta:
        db_table = 'Unidades'

class Usuarios(models.Model):
    Id_Usuario = models.AutoField(primary_key=True)
    Id_Escola = models.ForeignKey(Escolas, on_delete=models.CASCADE, db_column='Id_Escola')
    Id_Unidade = models.ForeignKey(Unidades, on_delete=models.CASCADE, db_column='Id_Unidade')
    Nome_Usuario = models.CharField(max_length=100)
    Email = models.EmailField(max_length=100, unique=True)
    password = models.CharField(max_length=100)
    first_acesso = models.CharField(max_length=100)
    Id_UserRole = models.CharField(max_length=100)
    Is_Ativo = models.CharField(max_length=100)
    class Meta:
        db_table = 'Usuarios'

class Periodos(models.Model):
    Id_Periodo = models.AutoField(primary_key=True)
    Nome_Periodo = models.CharField(max_length=100)

    class Meta:
        db_table = 'Periodos'

class Configuracoes(models.Model):
    Id_Configuracao = models.AutoField(primary_key=True)
    Id_Escola = models.CharField(max_length=100)
    Id_Unidade = models.CharField(max_length=100)
    Id_Periodo = models.CharField(max_length=100)
    Desc_Configuracao = models.CharField(max_length=100)
    Momento_Execucao = models.CharField(max_length=100)
    Titulo_Configuracao = models.CharField(max_length=100)

    class Meta:
        db_table = 'Configuracoes'

class Turmas(models.Model):
    Id_Turma = models.AutoField(primary_key=True)
    Nome_Turma = models.CharField(max_length=100)
    Id_Configuracao = models.CharField(max_length=100)

    class Meta:
        db_table = 'Turmas'

class Momentos(models.Model):
    Id_Momento = models.AutoField(primary_key=True)
    Id_Configuracao = models.CharField(max_length=100)
    Nome_Momento = models.CharField(max_length=100)

    class Meta:
        db_table = 'Momentos'

class Dias(models.Model):
    Id_Dia = models.AutoField(primary_key=True)
    Id_Configuracao = models.CharField(max_length=100)
    Nome_Dia = models.CharField(max_length=100)

    class Meta:
        db_table = 'Dias'


class Materias(models.Model):
    Id_Materia = models.AutoField(primary_key=True)
    Id_Configuracao = models.CharField(max_length=100)
    Nome_Materia = models.CharField(max_length=100)
    Preferencia = models.CharField(max_length=100)

    class Meta:
        db_table = 'Materias'


class Professores(models.Model):
    Id_Professor = models.AutoField(primary_key=True)
    Id_Configuracao = models.CharField(max_length=100)
    Nome_Professor = models.CharField(max_length=100)

    class Meta:
        db_table = 'Professores'

class Disponibilidades_Professores(models.Model):
    Id_Disponibilidade = models.AutoField(primary_key=True)
    Id_Professor = models.CharField(max_length=100)
    Id_Dia = models.CharField(max_length=100)
    Id_Momento = models.CharField(max_length=100)
    Id_Configuracao = models.CharField(max_length=100)
    Disponivel = models.CharField(max_length=100)

    class Meta:
        db_table = 'Disponibilidades_Professores'

class Disponibilidades_Turmas(models.Model):
    Disponibilidades_TurmasNew = models.AutoField(primary_key=True)
    Id_Turma = models.CharField(max_length=100)
    Id_Dia = models.CharField(max_length=100)
    Id_Momento = models.CharField(max_length=100)
    Id_Configuracao = models.CharField(max_length=100)
    Disponivel = models.CharField(max_length=100)

    class Meta:
        db_table = 'Disponibilidades_Turmas'

class Restricoes_Materias(models.Model):
    Id_NewMaterias = models.AutoField(primary_key=True)
    Id_Turma = models.CharField(max_length=100)
    Id_Materia = models.CharField(max_length=100)
    Id_Configuracao = models.CharField(max_length=100)
    Qtd_Minima_Semanal = models.CharField(max_length=100)
    Qtd_Maxima_Diaria = models.CharField(max_length=100)

    class Meta:
        db_table = 'Restricoes_Materias'


class Atribuicoes_Professores(models.Model):
    Id_Atribuicao = models.AutoField(primary_key=True)
    Id_Professor = models.CharField(max_length=100)
    Id_Configuracao = models.CharField(max_length=100)
    Id_Materia = models.CharField(max_length=100)
    Id_Turma = models.CharField(max_length=100)
    Preferencia = models.CharField(max_length=100)
    Qnt_Maxima_Diaria = models.CharField(max_length=100)

    class Meta:
        db_table = 'Atribuicoes_Professores'

class Rodadas_Modelo(models.Model):
    Id_Rodada = models.AutoField(primary_key=True)
    df_visualizacao_escola =  models.CharField(max_length=99999999999)
    df_visualizacao_professores = models.CharField(max_length=99999999999)
    df_resumo_janelas = models.CharField(max_length=99999999999)
    Numero_Rodada = models.CharField(max_length=100)
    Id_Configuracao = models.CharField(max_length=100)
    data_registro = models.DateTimeField(auto_now_add=True)  # ou auto_now=True, dependendo do seu caso
    class Meta:
        db_table = 'Rodadas_Modelo'

    
class Permissoes_Usuarios(models.Model):
    Id_Permissao = models.AutoField(primary_key=True)
    Id_Usuario =  models.CharField(max_length=99999999999)
    Cod_Tela = models.CharField(max_length=99999999999)
    
    class Meta:
        db_table = 'Permissoes_Usuarios'


