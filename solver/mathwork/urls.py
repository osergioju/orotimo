"""
URL configuration for mathwork project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf.urls import handler404, handler500
from .views import login, sair_comom, recuperar_senha, changelistagem, startpage, new_user, autenticacao, listar_tudo, solucoes, alterar_senha, administrativo, dash_inicial, inicio, meus_dados, cadastrar_usuario, meus_usuarios, turmas, momentos, dias, materias, professores, disponibilidade, disponbilidade_td, rodar_modelo, relatorios, ver_relatorio, server_error, new_escola, new_unidade, sair_adm

handler404 = 'mathwork.views.custom_404'
handler500 = 'mathwork.views.custom_500'

urlpatterns = [
    # Login inicial 
    path('', login, name='login'),
    path('alterar-senha/<int:id_user>/', alterar_senha, name='alterar_senha'),
    path('recuperar-senha/', recuperar_senha, name='recuperar_senha'),
    path('administrativo/', administrativo, name='administrativo'),
    path('autenticacao/', autenticacao, name='autenticacao'),

    # Dashboard
    path('inicio/<int:id_escola>/', inicio, name='inicio'),
    path('dashboard/<int:id_escola>/', dash_inicial, name='dash_inicial'),
    path('dashboard/cadastrar-usuario/<int:id_escola>/', cadastrar_usuario, name='cadastrar_usuario'),
    path('dashboard/meus-dados/<int:id_escola>/', meus_dados, name='meus_dados'),
    path('dashboard/meus-usuarios/<int:id_escola>/', meus_usuarios, name='meus_usuarios'),
    path('dashboard/solucoes/<int:id_escola>/', solucoes, name='solucoes'),

    # Modelo e suas configurações
    path('dashboard/turmas/<int:id_configuracao>/', turmas, name='turmas'),
    path('dashboard/momentos/<int:id_configuracao>/', momentos, name='momentos'),
    path('dashboard/dias/<int:id_configuracao>/', dias, name='dias'),
    path('dashboard/materias/<int:id_configuracao>/', materias, name='materias'),
    path('dashboard/disponbilidade-td/<int:id_configuracao>/', disponbilidade_td, name='disponbilidade_td'),
    path('dashboard/professores/<int:id_configuracao>/', professores, name='professores'),
    path('dashboard/disponibilidade/<int:id_configuracao>/', disponibilidade, name='disponibilidade'),
    path('dashboard/sair/', sair_comom, name='sair_comom'),

    # Modelo & rodar modelo 
    path('dashboard/rodar-modelo/<int:id_configuracao>/', rodar_modelo, name='rodar_modelo'),
    path('dashboard/relatorios/<int:id_configuracao>/', relatorios, name='relatorios'),
    path('dashboard/ver-relatorio/<int:id_configuracao>/<int:id_rodada>/', ver_relatorio, name='ver_relatorio'),

    # Custom admin Cronogrid
    path('admin/startpage/', startpage, name='startpage'),
    path('admin/nova-escola/', new_escola, name='new_escola'),
    path('admin/novo-usuario/', new_user, name='new_user'),
    path('admin/nova-unidade/', new_unidade, name='new_unidade'),
    path('admin/listar/', listar_tudo, name='listar_tudo'),
    path('admin/changelistagem/', changelistagem, name='changelistagem'),
    path('sair/', sair_adm, name='sair_adm'),

    # Admins
    path('admin/', admin.site.urls),
]
