# meuapp/views.py
import os
from datetime import datetime
import json
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth import logout, login
from django.contrib.auth.models import User, Group
from django.contrib.auth.decorators import login_required
from .models import Escolas, Unidades, Periodos, Usuarios, Configuracoes, Turmas, Momentos, Dias, Materias, Professores, Disponibilidades_Professores, Restricoes_Materias, Atribuicoes_Professores, Disponibilidades_Turmas, Rodadas_Modelo, Unidades, Permissoes_Usuarios
from django.db.models import Count, F, Value, CharField, Q, Subquery, OuterRef, Case, When, IntegerField, Exists, Value, OuterRef, Subquery, Max, Min
from django.db.models.functions import Concat
from django.db.models.aggregates import Func
from django.core.serializers import serialize
from utils.transforma_configs import transforma_configuracoes
from utils.utils import retorna_mensagens
from modelo.cronogrid import cronogrid
import random, hashlib, string
import pandas as pd
from django.db import transaction
from django.utils import timezone
from django.core.mail import send_mail
from django.http import JsonResponse
from django.template.loader import render_to_string
from urllib.parse import unquote
from sendgrid.helpers.mail import Mail
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


## 
class GroupConcat(Func):
    function = 'GROUP_CONCAT'
    template = '%(function)s(%(expressions)s)'
    allow_distinct = True
    
## ADMIN 
def generate_random_password(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for i in range(length))

@login_required
def startpage(request):
    return render(request, 'admin/startpage.html')

@login_required
def new_user(request):
    if request.method == 'POST':
        Nome_Usuario = request.POST['Nome_Usuario']
        Email_Usuario = request.POST['Email_Usuario']
        Escolas_Usuario = request.POST['Escolas_Usuario']
        Unidade_Usuario = request.POST['Unidade_Usuario']

        # Gerar senha e depois converter em md5
        generatedPass = generate_random_password()
        md5_hash = hashlib.md5(generatedPass.encode()).hexdigest()

        email_existe = Usuarios.objects.filter(Email=Email_Usuario).exists()

        # Verificar se há alguma configuração com o e-mail especificado
        if email_existe:
            messages.error(request, 'O e-mail informado já existe.')
        else:
            # Enviar senha por e-mail
            send_password_email(Email_Usuario, generatedPass)

            # Resgata objetos com base no id
            escola_id = Escolas_Usuario  
            escola = Escolas.objects.get(pk=escola_id)

            unidade_id = Unidade_Usuario 
            unidades = Unidades.objects.get(pk=unidade_id)

            cad_user = Usuarios(Id_Escola = escola, Id_Unidade = unidades, Nome_Usuario = Nome_Usuario,Email = Email_Usuario,password = md5_hash, first_acesso = 0, Id_UserRole=1, Is_Ativo = 1)
            cad_user.save()
            messages.success(request, 'Usuário cadastrado com sucesso, a senha foi enviada para o e-mail cadastrado.')

        return redirect('new_user')
    
    list_escolas = Escolas.objects.order_by('Id_Escola').all()
    list_unidades = Unidades.objects.order_by('Id_Unidade').all()
    return render(request, 'admin/new_user.html', {'list_escolas' : list_escolas, 'list_unidades' : list_unidades})

def recuperar_senha(request):
    if request.method == 'POST':
        acao = request.POST.get('acao')
        value = request.POST.get('value')

        if acao == 'mailrequest':
            # Vê se existe o e-mail
            email_existe = Usuarios.objects.filter(Email=value).exists()
            if email_existe:
                code_autentic = gerar_esquema()
                newpass_code(value, code_autentic)
                rendered = render_to_string('templatepart/confirm_code.html')
                request.session['checkcode_pass'] = code_autentic
                request.session['checkcode_email'] = value
                return JsonResponse({'showmessage': False, 'content': rendered})
            else:
                return JsonResponse({'showmessage': True, 'content': 'E-mail não encontrado.'})
        elif acao == 'checkcode':
            if int(value) == request.session['checkcode_pass']:
                rendered = render_to_string('templatepart/newpass.html')
                return JsonResponse({'showmessage': False, 'content': rendered})
            else:
                return JsonResponse({'showmessage': True, 'content': 'Código informado inválido'})

        elif acao == 'changepass':
            novasenha = hashlib.md5(value.encode()).hexdigest()
            Usuarios.objects.filter(Email=request.session['checkcode_email']).update(password=novasenha)
            rendered = render_to_string('templatepart/changepass_sucess.html')
            return JsonResponse({'showmessage': False, 'content': rendered})
        else:
            return JsonResponse({'showmessage': True, 'content': 'E-mail não encontrado.'})
    
    return render(request, 'login/recuperar_senha.html')



def send_email_via_gmail(to_email, subject, message_plain, message_html=None):
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

   # Configurações do seu e-mail do Gmail
    GMAIL_USER = 'sistemacronogrid@gmail.com'
    GMAIL_PASSWORD = 'bmwb wpec lahm cuqu'  

    try:
        msg = MIMEMultipart("alternative")
        msg['From'] = GMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        part1 = MIMEText(message_plain, 'plain')
        msg.attach(part1)

        if message_html:
            part2 = MIMEText(message_html, 'html')
            msg.attach(part2)

        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.send_message(msg)

        print(f"E-mail enviado com sucesso para {to_email}")
    except Exception as e:
        print(f"Erro ao enviar e-mail para {to_email}: {str(e)}")


# Enviar senha nova
def send_password_email(email, password):
    subject = 'Sua nova senha'
    message = f'Sua nova senha é: {password}\nPor favor, faça login usando esta senha.'
    send_email_via_gmail(email, subject, message)

# Enviar código de duas etapas
def conf_duas_etapas(email, code):
    subject = 'Seu código de autenticação'
    message_plain = f'Seu código de autenticação é: {code}'

    message_html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h2 style="color: #FE912B;">CRONOGRID</h2>
                <p style="font-size: 16px; color: #333;">Olá!</p>
                <p style="font-size: 16px; color: #333;">
                    Você solicitou um código de autenticação. Utilize o código abaixo para continuar:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="display: inline-block; background-color: #FE912B; color: #fff; font-size: 24px; padding: 15px 30px; border-radius: 8px; font-weight: bold;">
                        {code}
                    </span>
                </div>
                <p style="font-size: 14px; color: #777;">
                    Caso você não tenha solicitado este código, apenas ignore este e-mail.
                </p>
                <p style="font-size: 14px; color: #999; margin-top: 40px; text-align: center;">
                    &copy; {2025} Cronogrid. Todos os direitos reservados.
                </p>
            </div>
        </body>
    </html>
    """

    send_email_via_gmail(email, subject, message_plain, message_html)


# Enviar código de alteração de senha
def newpass_code(email, code):
    subject = 'Alteração de senha | Cronogrid'
    message = (
        f'Você solicitou uma nova senha, o código de autenticação é: {code}\n'
        'Caso você não tenha feito esta solicitação, entre em contato com o nosso suporte.'
    )
    send_email_via_gmail(email, subject, message)

@login_required
def new_escola(request):
    if request.method == 'POST':
        Nome_Escola = request.POST['Nome_Escola']
        Modulo_Contratado = request.POST['Modulo_Contratado']
        Dt_Contratacao = request.POST['Dt_Contratacao']
        Dt_Final_Contratacao = request.POST['Dt_Final_Contratacao']
        N_Rodadas_Contratadas = request.POST['N_Rodadas_Contratadas']

        cad_escola = Escolas(Nome_Escola= Nome_Escola,Modulo_Contratado= Modulo_Contratado,Dt_Cotratacao= Dt_Contratacao,Dt_Final_Cotratacao= Dt_Final_Contratacao,N_Rodadas_Contratadas= N_Rodadas_Contratadas, N_Rodadas_Utilizadas = 0, Is_Ativo=1)
        cad_escola.save()
        messages.success(request, 'Escola adicionada com sucesso!')
        return redirect('new_escola')
    
    list_escolas = Escolas.objects.order_by('Id_Escola').all()
    return render(request, 'admin/new_escola.html')

@login_required
def new_unidade(request):
    if request.method == 'POST':
        Id_Escola = request.POST['Id_Escola']
        Nome_Unidade = request.POST['Nome_Unidade']

        try:
            escola = Escolas.objects.get(pk=Id_Escola)
        except Escolas.DoesNotExist:
            messages.error(request, 'A escola selecionada não existe.')
            return redirect('new_unidade')

        unidade_existe = Unidades.objects.filter(Id_Escola=escola, Nome_Unidade=Nome_Unidade).exists()

        if unidade_existe:
            nome_escola = escola.Nome_Escola
            messages.error(request, f'A unidade {Nome_Unidade} para a escola {nome_escola} já existe.')
        else:
            cad_unidades = Unidades(Id_Escola=escola, Nome_Unidade=Nome_Unidade, Is_Ativo=1)
            cad_unidades.save()
            messages.success(request, 'Unidade adicionada com sucesso!')

        return redirect('new_unidade')
    
    list_escolas = Escolas.objects.order_by('Id_Escola').all()
    return render(request, 'admin/new_unidade.html', {'list_escolas': list_escolas})

@login_required
def listar_tudo(request):
    list_escolas = Escolas.objects.order_by('Id_Escola').all()
    list_unidades = Unidades.objects.order_by('Id_Unidade').all()
    list_usuarios = Usuarios.objects.select_related('Id_Escola').order_by('Id_Usuario').all()

    return render(request, 'admin/listar_tudo.html', {'list_escolas' : list_escolas, 'list_unidades' : list_unidades, 'list_usuarios' : list_usuarios})
    
def changelistagem(request):
    if request.method == 'POST':
        if request.POST.get('action') == 'y': 
            grupo_listedit = int(request.POST.get('x'))
            fullydata = request.POST.get('fullydata')
            pares_chave_valor = fullydata.split('&')

            dados_decodificados = {}
            for fully in pares_chave_valor:
                chave, valor = fully.split('=')
                dados_decodificados[chave] = unquote(valor)  # Decodificar o valor

            if grupo_listedit == 1:
                Escolas.objects.filter(Id_Escola=dados_decodificados['Id_Escola']).update(
                    Nome_Escola=dados_decodificados['Nome_Escola'],
                    Modulo_Contratado=dados_decodificados['Modulo_Contratado'],
                    Dt_Cotratacao=dados_decodificados['Dt_Cotratacao'],
                    Dt_Final_Cotratacao=dados_decodificados['Dt_Final_Cotratacao'],
                    N_Rodadas_Contratadas=dados_decodificados['N_Rodadas_Contratadas'],
                    N_Rodadas_Utilizadas=dados_decodificados['N_Rodadas_Utilizadas'],
                    Is_Ativo=dados_decodificados['Is_Ativo']
                )
                return JsonResponse({'content': 'Informações atualizadas'})
            
            if grupo_listedit == 2:
                Unidades.objects.filter(Id_Unidade=dados_decodificados['Id_Unidade']).update(
                    Nome_Unidade=dados_decodificados['Nome_Escola'],
                    Is_Ativo=dados_decodificados['Is_Ativo']
                )
                return JsonResponse({'content': 'Informações atualizadas'})
            
            if grupo_listedit == 3:
                Usuarios.objects.filter(Id_Usuario=dados_decodificados['Id_Usuario']).update(
                    Nome_Usuario=dados_decodificados['Nome_Usuario'],
                    Email=dados_decodificados['Email'],
                    Is_Ativo=dados_decodificados['Is_Ativo']
                )
                return JsonResponse({'content': 'Informações atualizadas'})

        else:
            grupo_listedit = int(request.POST.get('x'))
            id_listedit = int(request.POST.get('y'))

            if grupo_listedit == 1:
                rendered = render_to_string('admin/templatepart/edit_escola.html')
                get_escolas = list(Escolas.objects.filter(Id_Escola=id_listedit).values('Id_Escola', 'Nome_Escola','Modulo_Contratado','Dt_Cotratacao','Dt_Final_Cotratacao','N_Rodadas_Contratadas','N_Rodadas_Utilizadas','Is_Ativo'))
                return JsonResponse({'content': rendered, 'array' : get_escolas})
            
            elif grupo_listedit == 2:
                rendered = render_to_string('admin/templatepart/edit_unidades.html')
                get_unidades = list(Unidades.objects.filter(Id_Unidade=id_listedit).values('Id_Unidade', 'Nome_Unidade', 'Id_Escola__Nome_Escola', 'Is_Ativo'))
                return JsonResponse({'content': rendered, 'array' : get_unidades})
            
            elif grupo_listedit == 3:
                rendered = render_to_string('admin/templatepart/edit_usuarios.html')
                get_usuarios = list(Usuarios.objects.filter(Id_Usuario=id_listedit).values('Id_Usuario', 'Nome_Usuario', 'Email', 'Id_Escola__Nome_Escola', 'Id_Unidade__Nome_Unidade', 'Is_Ativo'))
                return JsonResponse({'content': rendered, 'array' : get_usuarios}) 

def sair_adm(request):
    logout(request)
    request.session['user_id'] = False
    request.session['user_email'] = False
    request.session['user_escola'] = False
    request.session['user_nome'] = False
    request.session['user_unidade'] = False
    request.session['authenticado'] = False
    return redirect('login')

def sair_comom(request):
    # Tira tudo que autentica
    request.session['user_id'] = False
    request.session['user_email'] = False
    request.session['user_escola'] = False
    request.session['user_nome'] = False
    request.session['user_unidade'] = False
    request.session['authenticado'] = False

    return redirect('login')

# Verifica aqui se o usuário existe 
def custom_authenticate(email=None, password=None):
    senha_crypt = None  # Definir senha_crypt com valor padrão
    
    try:
        user = Usuarios.objects.get(Email=email)
        crypt_senha = hashlib.md5(password.encode()).hexdigest()

        if user.password == crypt_senha:
            return user
        else:
            return None
    except ObjectDoesNotExist:
        return None

    

# Gerar aleatório pra confirmar no e-mail 
def gerar_esquema():
    # Gerar um número aleatório de seis dígitos
    numero = random.randint(100000, 999999)
    return numero

#checkuser_login
def checkuser_login(request, role, code):
    if 'user_id' in request.session:
        if request.session['user_email'] == False:
            return False
        else:
            if role == True:
                if request.session['user_role'] == 1:
                    if code == request.session['user_escola']:
                        return True
                    else:
                        return False
                else:
                    return False
            else:
                if code is False: 
                    return True
                else:
                    if Usuarios.objects.filter(Id_Escola=request.session['user_escola'], Email=request.session['user_email']).exists():
                        return True
                    else:
                        return False
    else: 
        return False

## Login 
def login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = custom_authenticate(email=email, password=password)

        if user is not None:
            # Armazenar informações do usuário na sessão
            request.session['user_id'] = user.Id_Usuario
            request.session['user_email'] = user.Email
            request.session['user_escola'] = user.Id_Escola.Id_Escola
            request.session['user_nome'] = user.Nome_Usuario
            request.session['user_unidade'] = user.Id_Unidade.Id_Unidade
            request.session['user_role'] = user.Id_UserRole
            request.session['authenticado'] = False

            id_user = user.Id_Usuario
            get_user = Usuarios.objects.get(Id_Usuario=id_user)
            if get_user.first_acesso == 0:
                return redirect('alterar_senha', id_user=id_user)
            else:   
                # Gera aleatório pra enviar por e-mail 
                # esquema = gerar_esquema()
                # conf_duas_etapas(email, esquema)
                # request.session['autenticacao'] = esquema
                request.session['authenticado'] = True
                return redirect('administrativo')
        else:
            messages.error(request, 'Credenciais inválidas.')
            return redirect('login')
    else:
        return render(request, 'login/login.html')

## Páginas de erro 
def custom_404(request, exception):
    return render(request, 'pages/error.html', status=404)

def custom_500(request):
    return render(request, 'pages/error.html', status=500)

## Autenticacao de duas
def autenticacao(request):
    if request.session['user_id']:
        if request.method == 'POST':
            resent = request.POST.get('typex')

            if resent:
                email = request.session['user_email']
                esquema = gerar_esquema()
                conf_duas_etapas(email, esquema)
                request.session['autenticacao'] = esquema
                return JsonResponse({'success': True, 'message': f'Novo código gerado {esquema}'})

            else:
                code = int(request.POST.get('autenticacao'))
                code_session = int(request.session['autenticacao'])

                if code == code_session:
                    request.session['authenticado'] = True
                    return JsonResponse({'success': True, 'error_message': False, 'redirect_url': True})
                else:
                    return JsonResponse({'success': False, 'error_message': f'O código é inválido.'})
        else:
            return render(request, 'login/autenticacao.html')
    else:
        return redirect('login')

## Alterar senha 
def alterar_senha(request, id_user):
    if request.session['user_id']:
        if request.method == 'POST':
            nova_senha = request.POST.get('senha_nova')
            novasenha_crypt = hashlib.md5(nova_senha.encode()).hexdigest()
            request.session['authenticado'] = True

            Usuarios.objects.filter(Id_Usuario=id_user).update(password=novasenha_crypt, first_acesso=1)
            return redirect('administrativo')

        return render(request, 'login/alterar_senha.html', {'id_user': id_user})
    else:
        return redirect('login')

## Alterar senha  
def administrativo(request):
    if checkuser_login(request, False, False):
        id_escola = request.session['user_escola']
        return render(request, 'login/admin_cover.html', {'id_escola': id_escola})
    else:
        return redirect('login')


# Visibilidade dos links
def visibilidade_links(request):
    id_user = request.session['user_id']
    lista_permissoes = Permissoes_Usuarios.objects.filter(Id_Usuario=id_user).all()
    
    return {'lista_permissoes' : lista_permissoes}

## Início
def inicio(request, id_escola):
    if checkuser_login(request, False, id_escola):
        ## Caso a pessoa tenha cadastrado uma configuração nova
        if request.method == 'POST':
            # Obter os dados do formulário
            idescola = request.POST.get('idescola')
            idunidade = request.POST.get('unidade')
            idperiodo = request.POST.get('periodo')
            nmescola = request.POST.get('nm_escola')
            txtunidade = request.POST.get('txt_unidade')
            txtperiodo = request.POST.get('txt_periodo')
            nm_config = request.POST.get('nm_config')
            execucao = datetime.now()

            ## Concatena a variável 
            resultado = f"{nmescola} - {txtunidade} - {txtperiodo}"

            # Criar um novo objeto Usuarios com os dados do formulário
            configuracoes_objeto = Configuracoes(Id_Escola=idescola, Id_Unidade=idunidade, Id_Periodo=idperiodo, Desc_Configuracao=resultado, Momento_Execucao=execucao, Titulo_Configuracao=nm_config)

            # Salvar o objeto no banco de dados
            configuracoes_objeto.save()

            # Resgata o último id da configuracao cadastrado
            get_configuracoes = Configuracoes.objects.filter(Id_Escola=id_escola).values('Id_Configuracao').last()
            id_configuracao = get_configuracoes['Id_Configuracao'] if get_configuracoes else None

            # Redirecionar para a página de sucesso ou outra página conforme necessário
            return redirect('turmas', id_configuracao)

        periodos = Periodos.objects.all() 
        unidades = Unidades.objects.filter(Id_Escola=id_escola).all()
        escolas = Escolas.objects.filter(Id_Escola=id_escola).first()
        configuracoes = Configuracoes.objects.filter(Id_Escola=id_escola).all()
        return render(request, 'dashboard/startscreen.html' ,{'id_escola' : id_escola, 'escolas' : escolas, 'configuracoes': configuracoes, 'periodos': periodos, 'unidades': unidades})
    else:
        return redirect('administrativo')

## Tela inicial
def dash_inicial(request, id_escola):
    if checkuser_login(request, True, id_escola):
        ## Processo para enviar os dados pro banco
        if request.method == 'POST':
            # Obter os dados do formulário
            idescola = request.POST.get('idescola')
            nome = request.POST.get('nome')
            email = request.POST.get('email')
            unidade_id = request.POST.get('unidade')

            # Gerar senha e depois converter em md5
            generatedPass = generate_random_password()
            md5_hash = hashlib.md5(generatedPass.encode()).hexdigest()

            email_existe = Usuarios.objects.filter(Email=email, Id_Escola=idescola).exists()

            # Verificar se há alguma configuração com o e-mail especificado
            if email_existe:
                messages.error(request, 'O e-mail informado já pertence a outra conta.')
            else:
                # Enviar senha por e-mail
                send_password_email(email, generatedPass)

                # Resgata objetos com base no id
                escola_id = idescola  
                escola = Escolas.objects.get(pk=escola_id)

                unidade_id = unidade_id 
                unidades = Unidades.objects.get(pk=unidade_id)
    
                cad_user = Usuarios(Id_Escola = escola, Id_Unidade = unidades, Nome_Usuario = nome,Email = email,password = md5_hash, first_acesso = 0, Id_UserRole=2, Is_Ativo = 1)
                cad_user.save()
                messages.success(request, 'Usuário cadastrado com sucesso, a senha foi enviada para o e-mail informado.')

                # Inclusão das permissões do usuário 
                quantidade_permissoes =  int(request.POST.get('qnt_permissoes', 0)) 

                for index in range(1, quantidade_permissoes + 1):
                    permisso_key = f'{index}'
                    permisso = request.POST.get(permisso_key)

                    if permisso:
                        id_user = cad_user.Id_Usuario

                        cad_permisso = Permissoes_Usuarios(Id_Usuario=id_user, Cod_Tela=index)
                        cad_permisso.save()
            
            # Redirecionar para a página de sucesso ou outra página conforme necessário
            return redirect('dash_inicial', id_escola)


        # Importa da base
        nome_usuario = request.session['user_nome']
        escolas = Escolas.objects.filter(Id_Escola=id_escola).first()
        unidades = Unidades.objects.filter(Id_Escola=id_escola).all()

        return render(request, 'dashboard/dashboard.html', {'escolas': escolas, 'unidades':unidades, 'nome_usuario' : nome_usuario, 'id_escola' : id_escola})
    else:
        return redirect('administrativo')

# Cadastrar os usuários
def cadastrar_usuario(request, id_escola):
    if checkuser_login(request, True, id_escola):
        ## Processo para enviar os dados pro banco
        if request.method == 'POST':
            # Obter os dados do formulário
            idescola = request.POST.get('idescola')
            nome = request.POST.get('nome')
            email = request.POST.get('email')
            unidade_id = request.POST.get('unidade')

            # Gerar senha e depois converter em md5
            generatedPass = generate_random_password()
            md5_hash = hashlib.md5(generatedPass.encode()).hexdigest()

            email_existe = Usuarios.objects.filter(Email=email, Id_Escola=idescola).exists()

            # Verificar se há alguma configuração com o e-mail especificado
            if email_existe:
                messages.error(request, 'O e-mail informado já pertence a outra conta.')
            else:
                # Enviar senha por e-mail
                send_password_email(email, generatedPass)

                # Resgata objetos com base no id
                escola_id = idescola  
                escola = Escolas.objects.get(pk=escola_id)

                unidade_id = unidade_id 
                unidades = Unidades.objects.get(pk=unidade_id)
    
                cad_user = Usuarios(Id_Escola = escola, Id_Unidade = unidades, Nome_Usuario = nome,Email = email,password = md5_hash, first_acesso = 0, Id_UserRole=2, Is_Ativo = 1)
                cad_user.save()
                messages.success(request, 'Usuário cadastrado com sucesso, a senha foi enviada para o e-mail informado.')

                # Inclusão das permissões do usuário 
                quantidade_permissoes =  int(request.POST.get('qnt_permissoes', 0)) 

                for index in range(1, quantidade_permissoes + 1):
                    
                    permisso_key = f'{index}'
                    permisso = request.POST.get(permisso_key)

                    if permisso:
                        id_user = cad_user.Id_Usuario

                        cad_permisso = Permissoes_Usuarios(Id_Usuario=id_user, Cod_Tela=index)
                        cad_permisso.save()
            
            # Redirecionar para a página de sucesso ou outra página conforme necessário
            return redirect('cadastrar_usuario', id_escola)


        # Importa da base
        nome_usuario = request.session['user_nome']
        escolas = Escolas.objects.filter(Id_Escola=id_escola).first()
        unidades = Unidades.objects.filter(Id_Escola=id_escola).all()

        return render(request, 'dashboard/new_usuario.html', {'escolas': escolas, 'unidades':unidades, 'nome_usuario' : nome_usuario, 'id_escola' : id_escola})
    else:
        return redirect('administrativo')

## Meus Dados 
def meus_dados(request, id_escola):
    if checkuser_login(request, True, id_escola):
        escolas = Escolas.objects.filter(Id_Escola=id_escola).first()
        n_restantes = int(escolas.N_Rodadas_Contratadas) - int(escolas.N_Rodadas_Utilizadas)
    
        return render(request, 'dashboard/meus_dados.html', {'id_escola': id_escola, 'escolas' : escolas, 'n_restantes' : n_restantes})
    else:   
        return redirect('login')

## Meus usuários 
def meus_usuarios(request, id_escola):
    if checkuser_login(request, True, id_escola):
        if request.method == 'POST':
            # Obter os dados do formulário
            if request.POST.get('action') == 'edit':
                iduser = request.POST.get('id')
                rendered = render_to_string('dashboard/templatepart/template_edituser.html')
                get_usuario = list(Usuarios.objects.filter(Id_Usuario=iduser).values('Id_Usuario', 'Nome_Usuario', 'Email', 'Is_Ativo'))
                get_permissions = list(Permissoes_Usuarios.objects.filter(Id_Usuario=iduser).values('Cod_Tela'))
                return JsonResponse({'content': rendered, 'array_usuario' : get_usuario, 'array_permissions' : get_permissions})
            else:
                userdata = request.POST.get('userdata')
                permissoes = request.POST.get('permissions')

                userdata_valores = userdata.split('&')
                permissoes_valores = permissoes.split('&')

                userdata_decodificados = {}
                for usr in userdata_valores:
                    chave, valor = usr.split('=')
                    userdata_decodificados[chave] = unquote(valor)  # Decodificar o valor)


                # Atualiza as infos do usuário
                Usuarios.objects.filter(Id_Usuario=userdata_decodificados['Id_Usuario']).update(Nome_Usuario=userdata_decodificados['Nome_Usuario'],Email=userdata_decodificados['Email'],Is_Ativo=userdata_decodificados['Is_Ativo'])

                # Exclui as permissões dele 
                Permissoes_Usuarios.objects.filter(Id_Usuario=userdata_decodificados['Id_Usuario']).delete()

                # Agora adiciona as novas permissoes
                for pmr in permissoes_valores:
                    chave, valor = pmr.split('=')
                    permiss_obj = Permissoes_Usuarios(Id_Usuario=userdata_decodificados['Id_Usuario'],Cod_Tela=chave)
                    permiss_obj.save()



        configuracoes = Configuracoes.objects.filter(Id_Escola=id_escola).all()
        usuarios = Usuarios.objects.filter(Id_Escola=id_escola).all()
        escolas = Escolas.objects.filter(Id_Escola=id_escola).first()
        return render(request, 'dashboard/meus_usuarios.html', {'configuracoes' : configuracoes, 'usuarios' : usuarios, 'id_escola': id_escola, 'escolas' : escolas})
    else:   
        return redirect('administrativo')

## Soluções 
def solucoes(request, id_escola):
    if checkuser_login(request, True, id_escola):
        configuracoes = Configuracoes.objects.filter(Id_Escola=id_escola).all()
        escolas = Escolas.objects.filter(Id_Escola=id_escola).first()
        return render(request, 'dashboard/solucoes.html', {'configuracoes' : configuracoes,'id_escola': id_escola, 'escolas' : escolas})
    else:   
        return redirect('administrativo')
    
## Turmas
def turmas(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        ## Pega a função das urls, se poder ve
    
        if request.method == 'POST':
            # Obter os dados do formulário
            quantidade_turmas = int(request.POST.get('counter', 0))

            lista_ids = []

            for index in range(1, quantidade_turmas + 1):
                # Construir os nomes dos campos para Materias
                idturma_key = f'idturma_{index}'
                turmas_key = f'turmas_{index}'

                turmas = request.POST.get(turmas_key)
                idturma = request.POST.get(idturma_key)

                if idturma is None:
                    # Criar um novo objeto Usuarios com os dados do formulário
                    turmas_obj = Turmas(Nome_Turma=turmas, Id_Configuracao=id_configuracao)

                    # Salvar o objeto no banco de dados
                    turmas_obj.save()

                    novo_id = turmas_obj.Id_Turma
                    lista_ids.append((novo_id))

                else:
                    Turmas.objects.filter(Id_Turma=idturma).update(Nome_Turma=turmas)
                    lista_ids.append((idturma))

            # Exibir a lista com todos os IDs, novo ID e IDs antigos
            lista_ids = [int(id) for id in lista_ids]

            
            # Exclua os registros cujo ID não está na lista fornecida e cuja Id_Configuracao seja igual à variável id_configuracao
            # Excluir agora os registros relacionados na tabela de restrições da turma 
            Turmas.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Turma__in=lista_ids).delete()
            Restricoes_Materias.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Turma__in=lista_ids).delete()
            Atribuicoes_Professores.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Turma__in=lista_ids).delete()
            Disponibilidades_Turmas.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Turma__in=lista_ids).delete()

            # Restante do código
            return redirect('turmas', id_configuracao)

        counts = count_instances(id_configuracao)

        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        page_resultados = Turmas.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Turma').all()
        return render(request, 'dashboard/turmas.html', {'id_conf' : id_configuracao, 'objconfig' : objsconfig, 'page_resultados' : page_resultados, **counts})
    return redirect('login')

## Momentos
def momentos(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        ## Pega a função das urls, se poder ve

        if request.method == 'POST':
            # Obter os dados do formulário
            idconfiguracao = request.POST.get('idconfig')
            quantidade_momentos = int(request.POST.get('counter', 0))

            lista_ids = []

            for index in range(1, quantidade_momentos + 1):
                # Construir os nomes dos campos para Momentos
                idmomentos_key = f'idmomentos_{index}'
                momentos_key = f'momentos_{index}'

                idmomento = request.POST.get(idmomentos_key)
                momentos = request.POST.get(momentos_key)

                if idmomento is None:
                    # Criar um novo objeto Usuarios com os dados do formulário
                    momentos_obj = Momentos(Nome_Momento=momentos, Id_Configuracao=id_configuracao)
                    print('CAiu aqui')
                    # Salvar o objeto no banco de dados 
                    momentos_obj.save()

                    novo_id = momentos_obj.Id_Momento
                    lista_ids.append((novo_id))
                else:
                    Momentos.objects.filter(Id_Momento=idmomento).update(Nome_Momento=momentos)
                    lista_ids.append((idmomento))

            # Exibir a lista com todos os IDs, novo ID e IDs antigos
            lista_ids = [int(id) for id in lista_ids]

            # Exclua os registros cujo ID não está na lista fornecida e cuja Id_Configuracao seja igual à variável id_configuracao
            Momentos.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Momento__in=lista_ids).delete()
            Disponibilidades_Turmas.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Momento__in=lista_ids).delete()
            Disponibilidades_Professores.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Momento__in=lista_ids).delete()

            return redirect('momentos', id_configuracao)

        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        page_resultados = Momentos.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Momento').all()

        counts = count_instances(id_configuracao)

        return render(request, 'dashboard/momentos.html', {'id_conf' : id_configuracao, 'objconfig' : objsconfig, 'page_resultados' : page_resultados, **counts})
    else:
        return redirect('login')

## Dias
def dias(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        ## Pega a função das urls, se poder ve
        if request.method == 'POST':
            # Obter os dados do formulário
            idconfiguracao = request.POST.get('idconfig')
            quantidade_dias = int(request.POST.get('counter', 0))
            
            lista_ids = []
            for index in range(1, quantidade_dias + 1):
                # Construir os nomes dos campos para Momentos
                iddias_key = f'iddias_{index}'
                dias_key = f'dias_{index}'

                iddias = request.POST.get(iddias_key)
                dias = request.POST.get(dias_key)

                if iddias is None:
                    # Criar um novo objeto Usuarios com os dados do formulário
                    dias_obj = Dias(Nome_Dia=dias, Id_Configuracao=id_configuracao)

                    # Salvar o objeto no banco de dados
                    dias_obj.save()

                    novo_id = dias_obj.Id_Dia
                    lista_ids.append((novo_id))
                else:
                    Dias.objects.filter(Id_Dia=iddias).update(Nome_Dia=dias)
                    lista_ids.append((iddias))
            
            # Exibir a lista com todos os IDs, novo ID e IDs antigos
            lista_ids = [int(id) for id in lista_ids]

            # Exclua os registros cujo ID não está na lista fornecida e cuja Id_Configuracao seja igual à variável id_configuracao
            Dias.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Dia__in=lista_ids).delete()
            Disponibilidades_Turmas.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Dia__in=lista_ids).delete()
            Disponibilidades_Professores.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Momento__in=lista_ids).delete()

            # Restante do código
            return redirect('dias', id_configuracao)


        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        page_resultados = Dias.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Dia').all()

        counts = count_instances(id_configuracao)

        return render(request, 'dashboard/dias.html', { 'id_conf' : id_configuracao, 'objconfig' : objsconfig, 'page_resultados' : page_resultados, **counts})
    else:
        return redirect('login')

## Dias
def materias(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        ## Pega a função das urls, se poder ve
        

        if request.method == 'POST':
            
            # Obter a quantidade de grupos do campo 'counter'
            quantidade_grupos = int(request.POST.get('counter', 0))
            quantidade_turmas = int(request.POST.get('counter_turmas', 0))
            materias_obj = None  # Declare a variável fora do primeiro loop

            #print(quantidade_grupos)
            lista_ids = []
            for index in range(1, quantidade_grupos + 1):
                print(index)
                # Construir os nomes dos campos para Materias
                materia_key = f'materia_{index}'
                preferencia_key = f'preferencia_{index}'
                id_materia_key = f'idmateria_{index}'

                # Obter os valores dos campos para Materias
                materia_value = request.POST.get(materia_key)
                preferencia_value = request.POST.get(preferencia_key)
                id_materia = request.POST.get(id_materia_key)

                if id_materia is None:
                    id_materia_int = 0
                else:
                    id_materia_int = int(id_materia)

                if id_materia_int > 0:
                    # Atualizar o objeto Materias no banco de dados com base no id_turma
                    Materias.objects.filter(Id_Materia=id_materia).update(Nome_Materia=materia_value, Preferencia=preferencia_value, Id_Configuracao=id_configuracao)
                    lista_ids.append((id_materia))
                else:
                    # Criar um novo objeto Materias com os dados do formulário
                    materias_obj = Materias(Nome_Materia=materia_value, Preferencia=preferencia_value, Id_Configuracao=id_configuracao)

                    # Salvar o objeto Materias no banco de dados
                    materias_obj.save()

                    novo_id = materias_obj.Id_Materia
                    lista_ids.append((novo_id))

                for i in range(1, quantidade_turmas + 1):
                    # Obter os valores dos campos para Restricoes_Materias
                    qntmin_key = f'minturma_{i}_{index}'
                    qntmax_key = f'maxturma_{i}_{index}'
                    id_turma = f'idturma_{i}_{index}'

                    turma = request.POST.get(id_turma)
                    qntmin_value = request.POST.get(qntmin_key)
                    qntmax_value = request.POST.get(qntmax_key)

                    
                    if materias_obj is None:
                        if Restricoes_Materias.objects.filter(Id_Materia=id_materia, Id_Configuracao=id_configuracao, Id_Turma=turma).exists():
                            # Atualizar o objeto Materias no banco de dados com base no id_turma
                            Restricoes_Materias.objects.filter(Id_Materia=id_materia, Id_Configuracao=id_configuracao, Id_Turma=turma).update(Qtd_Minima_Semanal=qntmin_value, Qtd_Maxima_Diaria=qntmax_value)
                        else:
                            restricoes_obj = Restricoes_Materias(Id_Turma=turma, Id_Materia=id_materia, Id_Configuracao=id_configuracao, Qtd_Minima_Semanal=qntmin_value, Qtd_Maxima_Diaria=qntmax_value)
                            
                            # Salvar o objeto Restricoes_Materias no banco de dados
                            restricoes_obj.save()
                    else:
                        # Recuperar o id da Materias recém-inserida
                        id_materia_get = materias_obj.Id_Materia

                        # Criar um novo objeto Restricoes_Materias com os dados do formulário
                        restricoes_obj = Restricoes_Materias(Id_Turma=turma, Id_Materia=id_materia_get, Id_Configuracao=id_configuracao, Qtd_Minima_Semanal=qntmin_value, Qtd_Maxima_Diaria=qntmax_value)
                        # Salvar o objeto Restricoes_Materias no banco de dados
                        restricoes_obj.save()
            
            # Exibir a lista com todos os IDs, novo ID e IDs antigos
            lista_ids = [int(id) for id in lista_ids]
        
            # Exclua os registros cujo ID não está na lista fornecida e cuja Id_Configuracao seja igual à variável id_configuracao
            Materias.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Materia__in=lista_ids).delete()
            Restricoes_Materias.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Materia__in=lista_ids).delete()
            Atribuicoes_Professores.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Materia__in=lista_ids).delete()

            return redirect('materias', id_configuracao)
        else:

            counts = count_instances(id_configuracao)    

            ## Pega a função das urls
            objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
            page_resultados = Materias.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Materia').all()
            get_turmas = Turmas.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Turma').all()

            # Obtém as restrições
            get_restricoes = Restricoes_Materias.objects.filter(Id_Configuracao=id_configuracao).all()
            
            # Converte get_restricoes para uma lista de dicionários
            restricoes_list = list(get_restricoes.values())
            
            # Converte a lista de dicionários para JSON
            restricoes_json = json.dumps(restricoes_list, indent=4)
            
            print(restricoes_json)
            return render(request, 'dashboard/materias.html', { 'json_materias' : restricoes_json, 'get_restricoes' : get_restricoes, 'get_turmas' : get_turmas, 'id_conf' : id_configuracao, 'objconfig' : objsconfig, 'page_resultados' : page_resultados, **counts})

    else:
        return redirect('login')

## Dias
def professores(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        ## Pega a função das urls, se poder ve

        if request.method == 'POST':
            grupos_dados = []
            gpdata = []
            grupo_atual = []
            id_professor = None
            ids_professores = []
            grupo_turmas = []
            preferencia_atual = None
            turma = {}
            ids_materias = []
            d = request.POST.get('d')

            # Adiciona o último grupo de dados à lista de grupos, se houver algum
            if grupo_atual:
                grupos_dados.append(grupo_atual)

            gpdata = json.loads(d)  # Faz o parse do JSON para Python
            # Itera sobre os grupos de dados
            
            # Itera sobre os dados de cada grupo
            for dados_professor in gpdata:
                # Extrai o nome do professor

                nome_professor = dados_professor['nome_professor']
                id_professor = dados_professor['id_professor']                    

                if(id_professor):
                    id_professor_cadastrado = None
                    # Atualizar o objeto Materias no banco de dados com base no id_turma
                    Professores.objects.filter(Id_Professor=id_professor).update(Nome_Professor=nome_professor)
                else:
                    # Cria um novo objeto Professores com os dados do formulário
                    professores_obj = Professores(Nome_Professor=nome_professor, Id_Configuracao=id_configuracao)

                    # Salva o objeto Professores no banco de dados
                    professores_obj.save()

                    # Resgata o id do indivíduo
                    id_professor_cadastrado = professores_obj.Id_Professor

                # Identifica os professores
                if(id_professor):
                    id_professor_send = id_professor
                else:
                    id_professor_send = id_professor_cadastrado

                ids_professores.append(id_professor_send)


                for lista_materias in dados_professor['materias']:
                    ids_materias = []

                    id_materia = lista_materias['id_materia']
                    preferencia = lista_materias['preferencia']
                    id_conf = id_configuracao
                    
                    Atribuicoes_Professores.objects.filter(Id_Professor=id_professor_send, Id_Configuracao=id_conf).delete()
                    for lista_turmas in lista_materias['turmas']:
                        id_turma = lista_turmas['id_turma']
                        qnt_max = lista_turmas['qnt_max_aulas']

                        grupo_turmas.append({
                            'id_turma': id_turma,
                            'id_professor' : id_professor_send,
                            'id_configuracao' : id_conf,
                            'id_materia' : id_materia,
                            'preferencia' : preferencia,
                            'qnt_max' : qnt_max
                        })

                        ids_materias.append(id_materia)

                Atribuicoes_Professores.objects.filter(Id_Configuracao=id_configuracao, Id_Professor=id_professor_send).exclude(Id_Materia__in=ids_materias).delete()
            for turmas_gp in grupo_turmas:
                # Finalmente cadastra as atribuições
                atribuicoes_obj = Atribuicoes_Professores(Id_Professor=turmas_gp['id_professor'], Id_Configuracao=turmas_gp['id_configuracao'], Id_Materia=turmas_gp['id_materia'],Id_Turma=turmas_gp['id_turma'],Preferencia=turmas_gp['preferencia'],Qnt_Maxima_Diaria=turmas_gp['qnt_max'])
                atribuicoes_obj.save()

            # AGora deleta os qiue não existe mais
            Professores.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Professor__in=ids_professores).delete()
            Atribuicoes_Professores.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Professor__in=ids_professores).delete()
            Disponibilidades_Professores.objects.filter(Id_Configuracao=id_configuracao).exclude(Id_Professor__in=ids_professores).delete()

        ## Pega a função das urls
        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        page_resultados = Professores.objects.filter(Id_Configuracao=id_configuracao).all()
        materias_dados = Materias.objects.filter(Id_Configuracao=id_configuracao).all()
        get_turmas = Turmas.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Turma').all()
        get_atribuicoes = Atribuicoes_Professores.objects.filter(Id_Configuracao=id_configuracao).all()
        get_uniqueatribuicoes_join = Professores.objects.filter(Id_Configuracao=id_configuracao).values(
            'Id_Professor', 
            'Nome_Professor',  
        ).annotate(
            Preferencia=Subquery(
                Atribuicoes_Professores.objects.filter(
                    Id_Professor=OuterRef('Id_Professor'),
                    Id_Configuracao='81'
                ).values('Preferencia')[:1]
            )
        ).order_by('Id_Professor')


       
        # Criar um conjunto para armazenar IDs únicos
        ids_unicos = set()

        # Iterar sobre as atribuições de professores para obter os IDs únicos
        for atribuicao in get_atribuicoes:
            ids_unicos.add(atribuicao.Id_Professor)

        atribuicoes = []
        for materias in get_atribuicoes:     
            materias = {
                'id_professor' : materias.Id_Professor,
                'materias_dados' : {
                    'id_materia' : materias.Id_Materia,
                    'turmas' : {
                        'id_turma' : materias.Id_Turma,
                        'qnt_max' : materias.Qnt_Maxima_Diaria
                    }
                }
            }
            atribuicoes.append(materias)
        

        # Criar uma lista para armazenar os dados agrupados
        dados_agrupados = []

        # Iterar sobre as atribuições e agrupar as matérias por professor
        for atribuicao in atribuicoes:
            id_professor = atribuicao['id_professor']
            materia_id = atribuicao['materias_dados']['id_materia']
            turma_id = atribuicao['materias_dados']['turmas']['id_turma']
            qnt_max = atribuicao['materias_dados']['turmas']['qnt_max']

            # Verificar se o professor já está na lista de dados agrupados
            professor_existente = False
            for professor in dados_agrupados:
                if professor['id_professor'] == id_professor:
                    professor_existente = True
                    # Verificar se a matéria já está associada ao professor
                    if materia_id in professor['materias_dados']:
                        # Verificar se a turma já está associada à matéria
                        turma_existente = False
                        for turma in professor['materias_dados'][materia_id]:
                            if turma['id_turma'] == turma_id:
                                turma_existente = True
                                break
                        if not turma_existente:
                            professor['materias_dados'][materia_id].append({
                                'id_turma': turma_id,
                                'qnt_max': qnt_max
                            })
                    else:
                        professor['materias_dados'][materia_id] = [{
                            'id_turma': turma_id,
                            'qnt_max': qnt_max
                        }]
                    break

            # Se o professor não existir na lista de dados agrupados, adicionar um novo registro
            if not professor_existente:
                dados_agrupados.append({
                    'id_professor': id_professor,
                    'materias_dados': {
                        materia_id: [{
                            'id_turma': turma_id,
                            'qnt_max': qnt_max
                        }]
                    }
                })

        counts = count_instances(id_configuracao)

        return render(request, 'dashboard/professores.html', { 'get_uniqueatribuicoes_join' : get_uniqueatribuicoes_join, 'dados_agrupados' : dados_agrupados, 'get_atribuicoes' : get_atribuicoes ,'turmas' : get_turmas,'materias' : materias_dados , 'id_conf' : id_configuracao, 'objconfig' : objsconfig, 'page_resultados' : page_resultados, **counts})
    else:
        return redirect('login')
    
# Disponiblidade de turmas 
def disponbilidade_td(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        ## Pega a função das urls

        if request.method == 'POST':
            # Obter a quantidade de grupos do campo 'counter'
            quantidade_grupos = int(request.POST.get('counter', 0))

            disponibilidades_para_criar = []
            disponibilidades_para_atualizar = []

            with transaction.atomic():  # Usar transação para garantir atomicidade
                for index in range(1, quantidade_grupos + 1):
                    idturma = request.POST.get(f'idturma_{index}')
                    qnt_momentos = int(request.POST.get(f'qnt_momentos_{index}'))

                    for indice in range(1, qnt_momentos + 1):
                        id_momento = int(request.POST.get(f'id_momento_{indice}_{index}_{idturma}'))
                        qnt_dias = int(request.POST.get(f'qnt_dias_{index}_{indice}'))

                        for i in range(1, qnt_dias + 1):
                            dias_check = request.POST.get(f'dia_{i}_{indice}_{idturma}')
                            dias_check_text = request.POST.get(f'diatext_{i}_{indice}_{idturma}')
                            dias_check_value = 1 if dias_check is not None else 0
                            id_dia = dias_check_text

                            # Verifica se já existe
                            existing_disponibilidade = Disponibilidades_Turmas.objects.filter(
                                Id_Turma=idturma,
                                Id_Dia=id_dia,
                                Id_Momento=id_momento,
                                Id_Configuracao=id_configuracao
                            ).first()

                            if existing_disponibilidade:
                                existing_disponibilidade.Disponivel = dias_check_value
                                disponibilidades_para_atualizar.append(existing_disponibilidade)
                            else:
                                disponibilidade_obj = Disponibilidades_Turmas(
                                    Id_Turma=idturma,
                                    Id_Dia=id_dia,
                                    Id_Momento=id_momento,
                                    Id_Configuracao=id_configuracao,
                                    Disponivel=dias_check_value
                                )
                                disponibilidades_para_criar.append(disponibilidade_obj)

            # Insere e atualiza em lote
            Disponibilidades_Turmas.objects.bulk_create(disponibilidades_para_criar)
            Disponibilidades_Turmas.objects.bulk_update(disponibilidades_para_atualizar, ['Disponivel'])

            """
            for index in range(1, quantidade_grupos + 1):
                # Construir os nomes dos campos para Materias
                idturma_key = f'idturma_{index}'
                qnt_momentos_key = f'qnt_momentos_{index}'
                # Obter os valores dos campos para Materias
                idturma = request.POST.get(idturma_key)
                qnt_momentos = int(request.POST.get(qnt_momentos_key))

                for indice in range(1, qnt_momentos + 1):
                    id_momento_key  = f'id_momento_{indice}_{index}_{idturma}'
                    qnt_dias_key = f'qnt_dias_{index}_{indice}'

                    id_momento = int(request.POST.get(id_momento_key))
                    qnt_dias = int(request.POST.get(qnt_dias_key))

                    for i in range(1, qnt_dias + 1):
                        # Obter os valores dos campos para Restricoes_Materias
                        dias_check_key = f'dia_{i}_{indice}_{idturma}'
                        dias_check_text_key = f'diatext_{i}_{indice}_{idturma}'
                        dias_check = request.POST.get(dias_check_key)
                        dias_check_text = request.POST.get(dias_check_text_key)
                        
                        if dias_check is None:
                            dias_check_value = 0
                            id_dia = dias_check_text
                        else:
                            dias_check_value = 1
                            id_dia = dias_check_text

                        existing_disponibilidade = Disponibilidades_Turmas.objects.filter(Id_Turma=idturma, Id_Dia=id_dia, Id_Momento=id_momento, Id_Configuracao=id_configuracao)

                        if existing_disponibilidade.exists():
                            # Se existir, atualizar o registro existente
                            existing_disponibilidade.update(Disponivel=dias_check_value)
                        else:
                            # Criar um novo objeto Materias com os dados do formulário    
                            disponibilidade_obj = Disponibilidades_Turmas(Id_Turma=idturma, Id_Dia=id_dia, Id_Momento=id_momento, Id_Configuracao=id_configuracao, Disponivel=dias_check_value)
                            
                            # Salvar o objeto Materias no banco de dados
                            disponibilidade_obj.save()
            """

        ## Envia valores à página
        turmas = Turmas.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Turma').all()
        momentos = Momentos.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Momento').all()
        dias = Dias.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Dia').all()
        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        page_resultados = Disponibilidades_Turmas.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Turma').all()
        
        raw_page_results = Disponibilidades_Turmas.objects.raw(
            """
            SELECT 
                Disponibilidades_TurmasNew, 
                Id_Turma, 
                Id_Momento, 
                Id_Configuracao,
                GROUP_CONCAT(CASE WHEN Disponivel != 0 THEN Id_Dia ELSE 0 END SEPARATOR '|') AS Id_Dia,
                GROUP_CONCAT(Disponivel SEPARATOR '|') AS Disponivel
            FROM Disponibilidades_Turmas
            WHERE Id_Configuracao = %s
            GROUP BY 
                Id_Turma, 
                Id_Momento, 
                Id_Configuracao, 
                Disponibilidades_TurmasNew
            ORDER BY Id_Turma
            """, 
            [id_configuracao]
        )

        json_resultados = serialize('json', raw_page_results)
        counts = count_instances(id_configuracao)    

        # get_atribuicoes = ( Atribuicoes_Professores.objects.raw( "SELECT Id_Atribuicao, Id_Professor, Id_Configuracao, Id_Materia, " "GROUP_CONCAT(Id_Turma SEPARATOR '|') as Id_Turma, Preferencia " "FROM Atribuicoes_Professores " "WHERE Id_Configuracao = %s " "GROUP BY Id_Materia, Id_Professor", [id_configuracao] ) )
        return render(request, 'dashboard/disponbilidade_turmas.html', {  'json_resultados' : json_resultados,'turmas' : turmas, 'dias' : dias ,'momentos' : momentos  ,'id_conf' : id_configuracao, 'objconfig' : objsconfig, 'page_resultados' : page_resultados, **counts})
    else:
        return redirect('login')
    
# Disponbilidade de turmas 
def disponibilidade(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):

        if request.method == 'POST':
            # Obter a quantidade de grupos do campo 'counter'
            quantidade_grupos = int(request.POST.get('counter', 0))

            # Listas para armazenar os objetos que serão criados ou atualizados
            disponibilidades_para_criar = []
            disponibilidades_para_atualizar = []

            with transaction.atomic():  # Usar transação para garantir atomicidade
                for index in range(1, quantidade_grupos + 1):
                    # Construir os nomes dos campos para Materias
                    idprofessor_key = f'idprofessor_{index}'
                    qnt_momentos_key = f'qnt_momentos_{index}'

                    # Obter os valores dos campos para Materias
                    idprofessor = request.POST.get(idprofessor_key)
                    qnt_momentos = int(request.POST.get(qnt_momentos_key))

                    for indice in range(1, qnt_momentos + 1):
                        id_momento_key = f'id_momento_{indice}_{index}_{idprofessor}'
                        qnt_dias_key = f'qnt_dias_{index}_{indice}'

                        id_momento = int(request.POST.get(id_momento_key))
                        qnt_dias = int(request.POST.get(qnt_dias_key))

                        for i in range(1, qnt_dias + 1):
                            # Obter os valores dos campos para Restricoes_Materias
                            dias_check_key = f'dia_{i}_{indice}_{idprofessor}'
                            dias_checktext_key = f'diatext_{i}_{indice}_{idprofessor}'
                            dias_check = request.POST.get(dias_check_key)
                            dias_checktext = request.POST.get(dias_checktext_key)

                            if dias_check != dias_checktext:
                                dias_check_value = 0
                                id_dia = dias_checktext
                            else:
                                dias_check_value = 1
                                id_dia = dias_check

                            # Verifica se já existe
                            existing_disponibilidade = Disponibilidades_Professores.objects.filter(
                                Id_Professor=idprofessor,
                                Id_Dia=id_dia,
                                Id_Momento=id_momento,
                                Id_Configuracao=id_configuracao
                            ).first()

                            if existing_disponibilidade:
                                existing_disponibilidade.Disponivel = dias_check_value
                                disponibilidades_para_atualizar.append(existing_disponibilidade)
                            else:
                                disponibilidade_obj = Disponibilidades_Professores(
                                    Id_Professor=idprofessor,
                                    Id_Dia=id_dia,
                                    Id_Momento=id_momento,
                                    Id_Configuracao=id_configuracao,
                                    Disponivel=dias_check_value
                                )
                                disponibilidades_para_criar.append(disponibilidade_obj)

                # Insere e atualiza em lote
                Disponibilidades_Professores.objects.bulk_create(disponibilidades_para_criar)
                Disponibilidades_Professores.objects.bulk_update(disponibilidades_para_atualizar, ['Disponivel'])
  

        ## Pega a função das urls
        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        page_resultados = Disponibilidades_Professores.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Professor').all()
        raw_page_results = Disponibilidades_Professores.objects.raw( 
            """
            SELECT 
                Id_Disponibilidade, 
                Id_Professor, 
                Id_Momento, 
                Id_Configuracao,
                GROUP_CONCAT(CASE WHEN Disponivel != 0 THEN Id_Dia ELSE 0 END SEPARATOR '|') AS Id_Dia,
                GROUP_CONCAT(Disponivel SEPARATOR '|') AS Disponivel
            FROM Disponibilidades_Professores
            WHERE Id_Configuracao = %s
            GROUP BY 
                Id_Professor, 
                Id_Momento, 
                Id_Disponibilidade, 
                Id_Configuracao
            ORDER BY Id_Professor
            """,
            [id_configuracao]
        )

        json_resultados = serialize('json', raw_page_results)

        momentos = Momentos.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Momento').all()
        dias = Dias.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Dia').all()
        professores = Professores.objects.filter(Id_Configuracao=id_configuracao).order_by('Id_Professor').all()

        counts = count_instances(id_configuracao)

        return render(request, 'dashboard/disponibilidade.html', {'json_resultados' : json_resultados ,'professores' : professores ,'dias' : dias ,'momentos' : momentos  ,'id_conf' : id_configuracao, 'objconfig' : objsconfig, 'page_resultados' : page_resultados, **counts})
    else:
        return redirect('login')
   
# Rodar modelo 
def rodar_modelo(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        rotateModel = False
        escolas_get = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        id_escola_get = escolas_get.Id_Escola
        if request.method == 'POST':
            rotateModel = True 
            
            # Obtenha o id_configuracao do formulário ou de onde quer que ele venha
            id_configuracao = int(request.POST.get('id_config', 0))

            # Chame a função transforma_configuracoes com o id_configuracao
            msg = transforma_configuracoes(id_configuracao)
            
            # Trata o modelo e vê se está ok 
            retorno_sobre_lista = retorna_mensagens(msg)
            counts = count_instances(id_configuracao)
            objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()

            print('Rodou modelo')
            if retorno_sobre_lista == []:
                # Modelo
                modelo = cronogrid(msg)
                
                if not isinstance(modelo, list):
                    msg = 'Não foi possível encontrar a solução! Mexa nas configurações e tente novamente!'
                    modelos_disponiveis = Rodadas_Modelo.objects.filter(Id_Configuracao=id_configuracao).all()
                    return render(request, 'dashboard/rodar_modelo.html', { 'modelos_disponiveis' : modelos_disponiveis,'rotateModel': rotateModel, 'msg_erro_2' : msg, 'id_conf' : id_configuracao, 'objconfig' : objsconfig, **counts})

                else:
                    tamanho_modelo = len(modelo)

                    # Suponha que tamanho_modelo seja o tamanho do modelo
                    df_array_escola = []
                    df_array_professores = []
                    df_array_janelas = []

                    for i in range(tamanho_modelo):

                        ## Seu DataFrame
                        view_escola = pd.DataFrame(modelo[i]["df_visualizacao_escola"])
                        view_professores = pd.DataFrame(modelo[i]["df_visualizacao_professores"])
                        view_janelas = pd.DataFrame(modelo[i]["df_resumo_janelas"])
                        
                        ## Gerando o HTML
                        df_escola = view_escola.to_dict(orient='records')
                        df_professores = view_professores.to_dict(orient='records')
                        df_janelas = view_janelas.to_dict(orient='records')

                        # Adicionando à lista
                        df_array_escola.append(df_escola)
                        df_array_professores.append(df_professores)
                        df_array_janelas.append(df_janelas)
                        
                    print(df_array_escola)
                    
                    # Consulta na base se já tem resultados, para somar com a quantidade de rodadas
                    registro = Escolas.objects.get(Id_Escola=id_escola_get)
                
                    # Verifique se o registro existe antes de acessar o campo
                    if registro.N_Rodadas_Utilizadas > 0:
                        rodads_valor = registro.N_Rodadas_Utilizadas + 1
                    else:
                        rodads_valor = 1

                    # Insere na base de dados o resultado do modelo 
                    insererodada_objeto = Rodadas_Modelo(df_visualizacao_escola=df_array_escola, df_visualizacao_professores=df_array_professores, df_resumo_janelas=df_array_janelas,Numero_Rodada=rodads_valor, Id_Configuracao=id_configuracao, data_registro=timezone.now())
                    Escolas.objects.filter(Id_Escola=id_escola_get).update(N_Rodadas_Utilizadas=rodads_valor) # Atualiza o campo da escola

                    # Salvar o objeto no banco de dados
                    insererodada_objeto.save()

                    # Mensagenzinha 
                    modelos_disponiveis = Rodadas_Modelo.objects.filter(Id_Configuracao=id_configuracao).order_by('-Id_Rodada').all()

                    # Renderize a página com o contexto
                    msg = 'Sucesso, seu modelo foi salvo. Clique aqui para visualizar.'
                    return render(request, 'dashboard/rodar_modelo.html', { 'modelos_disponiveis' : modelos_disponiveis,'rotateModel' : rotateModel, 'msg_sucesso' : msg, 'id_conf' : id_configuracao, 'objconfig' : objsconfig, **counts})

            else:
                msg = retorno_sobre_lista
                modelos_disponiveis = Rodadas_Modelo.objects.filter(Id_Configuracao=id_configuracao).all()
                return render(request, 'dashboard/rodar_modelo.html', { 'modelos_disponiveis' : modelos_disponiveis,'rotateModel': rotateModel, 'msg_erro' : msg, 'id_conf' : id_configuracao, 'objconfig' : objsconfig, **counts})

        counts = count_instances(id_configuracao)
        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        modelos_disponiveis = Rodadas_Modelo.objects.filter(Id_Configuracao=id_configuracao).order_by('-Id_Rodada').all()
        get_escola_info = Escolas.objects.get(Id_Escola=id_escola_get)
        N_Rodadas_Contratadas_proximidade = get_escola_info.N_Rodadas_Contratadas - 2
        N_Rodadas_Contratadas_total = get_escola_info.N_Rodadas_Contratadas
        N_Rodadas_Utilizadas = get_escola_info.N_Rodadas_Utilizadas

        counts = count_instances(id_configuracao)
        
        ## Aqui eu pergunto quanrtos tem em cada 
        Turmas_Count = Turmas.objects.filter(Id_Configuracao=id_configuracao).count()
        Momentos_Count = Momentos.objects.filter(Id_Configuracao=id_configuracao).count()
        Dias_Count = Dias.objects.filter(Id_Configuracao=id_configuracao).count()
        Materias_Count = Materias.objects.filter(Id_Configuracao=id_configuracao).count()
        Professores_Count = Professores.objects.filter(Id_Configuracao=id_configuracao).count()
        Disponibilidade_Count = Disponibilidades_Professores.objects.filter(Id_Configuracao=id_configuracao).count()
        Disponibilidade_Turmas_Count = Disponibilidades_Turmas.objects.filter(Id_Configuracao=id_configuracao).count()
        Restricoes_Materias_Count = Restricoes_Materias.objects.filter(Id_Configuracao=id_configuracao).count()
        Atribuicoes_Professores_Count = Atribuicoes_Professores.objects.filter(Id_Configuracao=id_configuracao).count()
        get_professores_count_atr = (
            Professores.objects.filter(Id_Configuracao=id_configuracao)
            .annotate(
                TemAtribuicao=Case(
                    When(
                        Exists(
                            Atribuicoes_Professores.objects.filter(
                                Id_Professor=OuterRef('Id_Professor'),
                                Id_Configuracao=id_configuracao
                            )
                        ),
                        then=Value(1)
                    ),
                    default=Value(0),
                    output_field=IntegerField()
                )
            )
            .values('Id_Professor', 'Nome_Professor', 'TemAtribuicao')
            .order_by('Id_Professor')
        )

        # Reduz os resultados a 0 ou 1
        status_atribuicoes = get_professores_count_atr.aggregate(
            possui_zeros=Min('TemAtribuicao'),
            maior_valor=Max('TemAtribuicao')
        )

        # Se existe um zero, o resultado será 0; caso contrário, o maior valor será retornado.
        resultado = 0 if status_atribuicoes['possui_zeros'] == 0 else status_atribuicoes['maior_valor']

        ## Agora faz um array para agrupar os counts 
        countse = {'Atrb_Profe' : resultado, 'Atribuicao_Count' : Atribuicoes_Professores_Count, 'Turmas_Count' : Turmas_Count, 'Dias_Count' : Dias_Count, 'Professores_Count' : Professores_Count, 'Materias_Count' : Materias_Count, 'Disponibilidade_Count' : Disponibilidade_Count, 'Disponibilidade_Turmas_Count' : Disponibilidade_Turmas_Count, 'Restricoes_Materias_Count' : Restricoes_Materias_Count, 'Momentos_Count' : Momentos_Count}
        # Verificar se há pelo menos um zero no dicionário
        has_zero = any(value == 0 for value in countse.values())

        return render(request, 'dashboard/rodar_modelo.html', {'countse' : countse, 'has_zero': has_zero, 'total_counts' :  countse, 'N_Rodadas_Contratadas_total' : N_Rodadas_Contratadas_total ,'N_Rodadas_Contratadas_proximidade' : N_Rodadas_Contratadas_proximidade, 'N_Rodadas_Utilizadas' : N_Rodadas_Utilizadas,   'modelos_disponiveis' : modelos_disponiveis, 'rotateModel' : rotateModel, 'id_conf' : id_configuracao, 'objconfig' : objsconfig, **counts})
    else:
        return redirect('login')

# Relatórios
def relatorios(request, id_configuracao):
    if checkuser_login(request, False, id_configuracao):
        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        modelos_disponiveis = Rodadas_Modelo.objects.filter(Id_Configuracao=id_configuracao).order_by('-Id_Rodada').all()

        counts = count_instances(id_configuracao)

        return render(request, 'dashboard/relatorios.html', {'modelos_disponiveis' : modelos_disponiveis, 'id_conf' : id_configuracao, 'objconfig' : objsconfig, **counts})
    else:
        return redirect('login')

# Relatórios
def ver_relatorio(request, id_configuracao, id_rodada):
    if checkuser_login(request, False, id_configuracao):
        objsconfig = Configuracoes.objects.filter(Id_Configuracao=id_configuracao).first()
        modelos_disponiveis = Rodadas_Modelo.objects.filter(Id_Rodada=id_rodada).all()
        professores_select = Professores.objects.filter(Id_Configuracao=id_configuracao).order_by('Nome_Professor')
        turmas_select = Turmas.objects.filter(Id_Configuracao=id_configuracao).order_by('Nome_Turma')

        counts = count_instances(id_configuracao)

        return render(request, 'dashboard/ver_relatorio.html', {'turmas_select' : turmas_select,  'professores_select' : professores_select,   'modelos_disponiveis' : modelos_disponiveis, 'id_conf' : id_configuracao, 'objconfig' : objsconfig, **counts})
    else:
        return redirect('login')

# View de erros no servidor, tem que gerar log 
def server_error(request):
    return render(request, 'dashboard/error_page.html', status=500)


###########DASHBOARD############
## Sidebar links ##
def count_instances(id_configuracao):
    # Sua lógica para contar as instâncias e adicioná-las ao contexto global
    count_turmas = Turmas.objects.filter(Id_Configuracao=id_configuracao).count()
    count_momentos = Momentos.objects.filter(Id_Configuracao=id_configuracao).count()
    count_dias = Dias.objects.filter(Id_Configuracao=id_configuracao).count()
    count_materias = Materias.objects.filter(Id_Configuracao=id_configuracao).count()
    count_professores = Professores.objects.filter(Id_Configuracao=id_configuracao).count()
    count_disponibilidade = Disponibilidades_Professores.objects.filter(Id_Configuracao=id_configuracao).count()
    count_disponibilidade_turmas = Disponibilidades_Turmas.objects.filter(Id_Configuracao=id_configuracao).count()
    x_rdM = Rodadas_Modelo.objects.filter(Id_Configuracao=id_configuracao).count()


    ## Aqui eu pergunto quanrtos tem em cada 
    Turmas_Count_x = Turmas.objects.filter(Id_Configuracao=id_configuracao).count()
    Momentos_Count_x = Momentos.objects.filter(Id_Configuracao=id_configuracao).count()
    Dias_Count_x = Dias.objects.filter(Id_Configuracao=id_configuracao).count()
    Materias_Count_x = Materias.objects.filter(Id_Configuracao=id_configuracao).count()
    Professores_Count_x = Professores.objects.filter(Id_Configuracao=id_configuracao).count()
    Disponibilidade_Count_x = Disponibilidades_Professores.objects.filter(Id_Configuracao=id_configuracao).count()
    Disponibilidade_Turmas_Count_x = Disponibilidades_Turmas.objects.filter(Id_Configuracao=id_configuracao).count()
    Restricoes_Materias_Count_x = Restricoes_Materias.objects.filter(Id_Configuracao=id_configuracao).count()
    Atribuicoes_Professores_x = Atribuicoes_Professores.objects.filter(Id_Configuracao=id_configuracao).count()

    ## Agora faz um array para agrupar os counts 
    counterex = {'Atribuicao_Count' : Atribuicoes_Professores_x, 'Turmas_Count' : Turmas_Count_x, 'Dias_Count' : Dias_Count_x, 'Professores_Count' : Professores_Count_x, 'Materias_Count' : Materias_Count_x, 'Disponibilidade_Count' : Disponibilidade_Count_x, 'Disponibilidade_Turmas_Count' : Disponibilidade_Turmas_Count_x, 'Restricoes_Materias_Count' : Restricoes_Materias_Count_x, 'Momentos_Count' : Momentos_Count_x}

    # Adiciona count_turmas ao contexto global
    return {'rm' : x_rdM, 'countess' : counterex, 'count_disponibilidade_turmas' : count_disponibilidade_turmas, 'count_turmas': count_turmas, 'count_momentos': count_momentos, 'count_dias': count_dias, 'count_materias': count_materias, 'count_professores': count_professores, 'count_disponibilidade': count_disponibilidade}
