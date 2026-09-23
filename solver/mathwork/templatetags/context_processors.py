from mathwork.models import Permissoes_Usuarios, Usuarios, Configuracoes
from django.urls import resolve, Resolver404


def visibilidade_links(request):
    lista_permissoes = []
    admin = False  # Defina a variável admin com um valor padrão
    if 'user_id' in request.session:
        if request.session['user_id'] is not False:
            id_user = request.session['user_id']
            stat_user = Usuarios.objects.filter(Id_Usuario=id_user).first()
            id_status_user = stat_user.Id_UserRole 
            
            if id_status_user == 1: 
                admin = 0
                request.session['adm_statuses'] = 0
            else:
                admin = 1
                request.session['adm_statuses'] = 1

            lista_permissoes = Permissoes_Usuarios.objects.filter(Id_Usuario=id_user).all()
            
            # Pega a configuração 
            url = request.path
            partes_url = url.split('/')
            id_conf = partes_url[-2]  # O penúltimo elemento da lista, que é o ID da turma
            if id_conf.isdigit():
                get_config = Configuracoes.objects.filter(Id_Configuracao=id_conf).first()
            else:
                get_config = 0

            if admin == 0:
                lista_permissoes_cod_tela = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15]
            else:
                lista_permissoes_cod_tela = Permissoes_Usuarios.objects.filter(Id_Usuario=id_user).values_list('Cod_Tela', flat=True)
            return {'get_config' : get_config, 'lista_permissoes_cod_tela' : lista_permissoes_cod_tela, 'lista_permissoes': lista_permissoes, 'admin_status' : admin, 'nome_user' : stat_user.Nome_Usuario, 'id_escola_url' : stat_user.Id_Escola, 'id_unidade_get' : stat_user.Id_Unidade}
        else:
            return {'logout' : True}
    else:
        return {'lista_permissoes': 'deu', 'admin_status' : '', 'nome_user' : ''}


def check_permissions(request):
    try:
        if 'user_id' in request.session:
            url_name = resolve(request.path).url_name
            id_user = request.session['user_id']
            lista_permissoes = Permissoes_Usuarios.objects.filter(Id_Usuario=id_user).all()
            return {'maxima': lista_permissoes, 'url_name': url_name}
        else:
            return {'maxima': 0, 'url_name': None}
    except Resolver404:
        return {'maxima': 0, 'url_name': None}
