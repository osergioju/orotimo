/*
function incredec(x, y, z) {
    // Abrir o drop down & popular seus filhos
    $(function(){
        

        // Duplicador de campo 
        $('.duplicatormaximus____OFFF').off('click').on('click', function(){
            var copiar_div = document.querySelector('.coopyx_max');
            var new_copiar_div = copiar_div.cloneNode(true);
            var superindex = $(this).closest('.unicogenerated-field').find('.ihaveindex').data('myindexbloc');
            // Remove a classe pra não dar b.o na hora de adicionar o novovalor 
            new_copiar_div.classList.remove('coopyx_max');
            // Conta as divs e vê quanto add no inputer 
            
            qnt_divs = $(this).parent('.duplicator_turmas_materias').parent('.duplicater_add_div').children('.relacional_professorxmateria').length;

            new_copiar_div.innerHTML = new_copiar_div.innerHTML.replace(/REPLACEINDEX/g, superindex);    
            new_copiar_div.innerHTML = new_copiar_div.innerHTML.replace(/newreplaceindex/g, qnt_divs + 1);    


            // Finalmente adiciona a div duplicada
            $(this).parent('.duplicator_turmas_materias').parent('.duplicater_add_div').append(new_copiar_div);
            $(this).next('.count_materias').val(qnt_divs + 1);
        }); 

    });

    
    var inputElements = document.getElementsByClassName('receive_val');
    
    // Verifique se há pelo menos um elemento com a classe 'receive_val'
    if (inputElements.length === 0) {
        console.error('Nenhum elemento com a classe receive_val encontrado.');
        return;
    }

    // Vamos assumir que estamos interessados no primeiro elemento com a classe 'receive_val'
    var inputval = inputElements[0];
    var valor_atual = parseInt(inputval.value);
    var counter_input = document.getElementById('counter');
    
    if (x === 'up') {
        novovalor = valor_atual + 1;
    } else {
        if (valor_atual === 0) {
            return;
        } else {
            novovalor = valor_atual - 1;
        }
    }

    inputval.value = novovalor;
    counter_input.value = novovalor;

    // Referência à div repeaterbody-line
    var repeaterBodyLine = document.getElementById('repeaterbody-line');
    
    if (x === 'up') {
        // Adicionar a div modelo
        var newDiv = document.createElement('div');
        if(z == 'type1'){
            newDiv.className = 'col-12 col-lg-6';
            newDiv.innerHTML = '<div class="formg_math"><label for="' + novovalor + '"><h3>'+ y +' ' + novovalor + '</h3><input class="required" type="text" name="'+ y.toLowerCase() +'_'+novovalor+'" id="' + novovalor + '"></label></div>';
            
        }
        else if(z == 'type2'){
            var type2Div = document.querySelector('.fieldto-copy');
            var newDiv = type2Div.cloneNode(true);
            
            // Remove a classe pra não dar b.o na hora de adicionar o novovalor 
            newDiv.classList.remove('fieldto-copy');

            // Substitiui tudo que é REPLACEINDEX pelo id necessário 
            newDiv.innerHTML = newDiv.innerHTML.replace(/REPLACEINDEX/g, novovalor);
        }
        else{
            newDiv.className = 'col-12 col-lg-6';
            newDiv.innerHTML = '<div class="formg_math"><label for="' + novovalor + '"><h3>'+ y +' ' + novovalor + '</h3><input class="required" type="text" name="'+ y.toLowerCase() +'_'+novovalor+'" id="' + novovalor + '"></label></div>';
    
        }
        repeaterBodyLine.appendChild(newDiv);
    } else {
        // Remover a última div modelo
        var lastChild = repeaterBodyLine.lastElementChild;
        if (lastChild) {
            repeaterBodyLine.removeChild(lastChild);
        }
    }


    checkSave();
}
*/

// Pega os textos da unidade e período 
function gtvalue(x){
    // Pega o data attr 
    dataattr = x.options[x.selectedIndex].dataset.title;
    
    // Pega o id 
    idfield = x.id;

    // Alimentar o campo com o id
    fieldAlimenta = document.getElementById('r_'+idfield);
    fieldAlimenta.value = dataattr;
}


// Open professor calendar 
$('.header-looperdays button').on('click', function(){
   $(this).parent('.header-looperdays').next('.content-looperdays').slideToggle();
   $(this).toggleClass('active-loperdays');
});

// Check e uncheck all 
function checkun(x, y){
    if(x == 1){
        $('.bodhy-calendar[data-lopperdays="'+y+'"] input').each(function(){
            $(this).prop('checked', true);
        });
    }
    else{
        $('.bodhy-calendar[data-lopperdays="'+y+'"] input').each(function(){
            $(this).prop('checked', false);
        });
    }
}

/// Exportar para xlsx 
function exportarParaXLSX(x,y) {
    var tabela = document.getElementById(x);

    var dataTable = $('#'+x).DataTable();
    dataTable.page.len(-1).draw();

    var livro = XLSX.utils.table_to_book(tabela, { sheet: "Visualização" });
    XLSX.writeFile(livro, y+".xlsx");

    dataTable.page.len(10).draw();
}


//////////
/*  SUPER VALIDAÇÃO DE FORMULÁRIO/
////////*/
$('#fm').submit(function(event) {
    // Validar campos do formulário no lado do cliente
    var isValid = true;

    $('#fm .required').each(function(){
        if ($(this).is('select')) {
            sou = 'select';
            valor = $(this).find('option:selected').attr('value');
        }
        else{
            sou = 'outro';
            valor = $(this).val();
        }

        if (valor == '') {
            isValid = false;
            $(this).addClass('error_field');
        } 
        else {
            $(this).removeClass('error_field');
        }
    });

    if (!isValid) {
        event.preventDefault(); // Impede o envio do formulário se houver erros
    }
    else{
        $('.fakeloader').fadeIn();
    }
});

$('.fm').submit(function(event) {
    $('.fakeloader').fadeIn();
});

$(window).on('load', function(){
    checkSave();
});

function checkSave(){
    qnt_fields = $('.receive_val').val();

    if(qnt_fields <= 0){
        $('.button-savestage button').attr('disabled', true);
    }
    else{
        $('.button-savestage button').attr('disabled', false);
    }
}

// Ativa o campo de unidade com base no de Escolas
$('#escola_newuser').on('change', function(){
    escola_id = $(this).val();
    $('#unidade_newuser option:first-of-type').prop('selected', true);

    // Tira o disabled da unidade
    $('#unidade_newuser').removeClass('disabled_unidadefield');

    // Agora, só fica exibindo os campos que tem o data como o id selecionado 
    $('#unidade_newuser option').addClass('disabled_opt');
    $('#unidade_newuser option[data-idescola="'+escola_id+'"]').removeClass('disabled_opt');
});

$(document).ready(function(){
    $("#2").keyup(function(){
        validarSenha();
    });

    $("#3").keyup(function(){
        validarSenha();
    });

    function validarSenha() {
        var senha = $("#2").val();
        var confirmarSenha = $("#3").val();
        var senhaValida = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{6,}$/.test(senha);
        
        if (!senhaValida) {
            $("#2").removeClass("valid-password").addClass("invalid-password");
            $(".error-message").remove();
            $(".formg_login_first:first").append('<p class="error-message">A senha não atende aos requisitos.</p>');
            $("button.altPass").prop("disabled", true);
        } else {
            $("#2").removeClass("invalid-password").addClass("valid-password");
            $(".error-message").remove();
            if (senha !== confirmarSenha) {
                $(".formg_login_first:eq(1)").append('<p class="error-message">As senhas não coincidem.</p>');
                $("button.altPass").prop("disabled", true);
            } else {
                $("button.altPass").prop("disabled", false);
            }
        }
    }
});

// Abrir configurações 
$('.flex-settings button').on('click', function(){
    $('.settings-guide').slideToggle();
});


////////////////////////////
// ADD GENÉRICO & remover 
///////////////////////////
function genericAddmore(y, z){
    // Pega o total de intens em loop nessa página 
    current_value = document.getElementById('counter');
    current_value_value = current_value.value;

    // Novo valor 
    novovalor = parseInt(current_value_value) + 1;

    // Generate novos campos 
    current_value.value = novovalor;

    // Adicionar a div modelo
    var repeaterBodyLine = document.getElementById('repeaterbody-line');
    var newDiv = document.createElement('div');
    if(z == 'type1'){
        newDiv.className = 'col-12 col-lg-6';
        newDiv.id = 'fatherfield_' + novovalor;
        newDiv.innerHTML = '<div class="formg_math"><label for="' + novovalor + '"><h3>'+ y +' ' + novovalor + '</h3><input class="replace_index required" type="text" name="'+ y.toLowerCase() +'_'+novovalor+'" id="' + novovalor + '"><button type="button" class="removeMe" onclick="removeMe(\'type\', \''+ novovalor +'\')"></button></label></div>';
        
    }
    else if(z == 'type2' || z == 'type3'){
        var type2Div = document.querySelector('.fieldto-copy');
        var newDiv = type2Div.cloneNode(true);
        
        // Remove a classe pra não dar b.o na hora de adicionar o novovalor 
        newDiv.classList.remove('fieldto-copy');

        // Substitiui tudo que é REPLACEINDEX pelo id necessário 
        newDiv.innerHTML = newDiv.innerHTML.replace(/REPLACEINDEX/g, novovalor);
        newDiv.id = 'fatherfield_' + novovalor;
    }
    else{
        newDiv.className = 'col-12 col-lg-6';
        newDiv.id = 'fatherfield_' + novovalor;
        newDiv.innerHTML = '<div class="formg_math"><label for="' + novovalor + '"><h3>'+ y +' ' + novovalor + '</h3><input class="replace_index required" type="text" name="'+ y.toLowerCase() +'_'+novovalor+'" id="' + novovalor + '"></label></div>';

    }
    repeaterBodyLine.appendChild(newDiv);
}

function removeMe(type, id) {
    var element = document.getElementById('fatherfield_' + id);
    element.remove();

    updatefieldId(type);
}

function updatefieldId(type){
    if(type == 'type1'){
        var count = document.getElementsByClassName('formg_math').length;
        // Atualiza título de cada um dos campos
        var spans = document.querySelectorAll('.formg_math h3');
        var formgMaths = document.querySelectorAll('.formg_math');

        // Atualiza titulo dos boxes que contém m indexes
        spans.forEach(function(span, index) {
            var originalText = span.textContent;
            var newText = originalText.replace(/\d+/g, index + 1);
            span.textContent = newText; // Atualiza o texto do span
        });
    }
    else{
        var count = document.getElementsByClassName('carouseltype2').length;
        var formgMaths = document.querySelectorAll('.carouseltype2:not(.fieldto-copy)');
    }
    
    // Atualiza name/id de cada um dos campos internos 
    if(formgMaths){
        formgMaths.forEach(function(formgMath, index) {
            console.log(index);
            // Troca id do blocão
            if(type == 'type2' || type == 'type3'){
                var span_index = formgMath.getElementsByClassName('spanex_index'); 
                var id_conteudo = formgMath.getElementsByClassName('id_conteudo'); 
    
                if(id_conteudo.length > 0){
                    var split_id_conteudo = id_conteudo[0].name.split('_');
                    split_id_conteudo[1] = index + 1;
                    id_conteudo[0].name = split_id_conteudo.join('_');
                }   
                span_index[0].innerHTML = index + 1;
            }
    
            var inputs = formgMath.querySelectorAll('.replace_index');
            inputs.forEach(function(input) {
                if(type == 'type3'){
                    var label_pai = input.parentElement;
                    var originalName = input.getAttribute('name');
                    var originalId = input.getAttribute('id');
                    var originalFor = label_pai.getAttribute('for');

        
                    var newName = originalName.replace(/\d+/g, index + 1);
                    var newId = originalId.replace(/\d+/g, index + 1);
                    var newFor = originalFor.replace(/\d+/g, index + 1);

                    //label_pai.setAttribute('for', newFor); 
                    input.setAttribute('name', newName); 
                    input.setAttribute('id', newId); 
                }   
                else{
                    var originalName = input.getAttribute('name');
                    var originalId = input.getAttribute('id');
        
                    var newName = originalName.replace(/\d+/g, index + 1);
                    var newId = originalId.replace(/\d+/g, index + 1);
        
                    input.setAttribute('name', newName); 
                    input.setAttribute('id', newId); 
                }
            });
    
            
            
            if(type == 'type2'){
                var miniform_g = formgMath.querySelectorAll('.miniform_g');
                miniform_g.forEach(function(miniform, index2) {
                    var input_miniform = miniform.getElementsByClassName('replace_index_level2');
                    var id_minifor = miniform.getElementsByClassName('id_minifor');
                    
                    var split_name = input_miniform[0].name.split('_');
                    var split_id = id_minifor[0].name.split('_');
    
                    split_name[1] = index2 + 1;
                    split_name[2] = index + 1;
    
                    split_id[1] = index2 + 1;
                    split_id[2] = index + 1;
    
                    // Reatribuindo o nome ao campo
                    input_miniform[0].name = split_name.join('_');
                    id_minifor[0].name = split_id.join('_');
                });
            }
    
            if (type == 'type3') {
                var miniform_g = formgMath.querySelectorAll('.relacional_professorxmateria');
                miniform_g.forEach(function (miniform, index2) {
                    var select_materia = miniform.querySelectorAll('[name^="mateira_"]');
                    var label_pai = select_materia[0].parentElement;
                    var split_name_materia = select_materia[0].name.split('_');
                    var split_id_materia = select_materia[0].name.split('_');
            
                    var split_for = label_pai.htmlFor.split('_');  // Ajuste aqui para usar htmlFor ao invés de label_pai.for
            
                    split_name_materia[1] = index2 + 1;
                    split_name_materia[2] = index + 1;
            
                    split_id_materia[1] = index2 + 1;
                    split_id_materia[2] = index + 1;
            
                    split_for[1] = index2 + 1;
                    split_for[2] = index + 1;
            
                    // Reatribuindo o nome ao campo
                    select_materia[0].name = split_name_materia.join('_');
                    select_materia[0].id = split_id_materia.join('_');
                    // label_pai.htmlFor = split_for.join('_');  // Corrigido para usar htmlFor ao invés de label_pai.for

                    

                    // Agora pega os campos minis
                    var turmas_selection = miniform.querySelectorAll('.turmas_selection');
                    turmas_selection.forEach(dontfeel => {
                        var label_pai = dontfeel.parentElement;

                        var split_name_materia = dontfeel.name.split('_');
                        var split_id_materia = dontfeel.name.split('_');
                        var split_for = label_pai.htmlFor.split('_');  // Ajuste aqui para usar htmlFor ao invés de label_pai.for

                        split_name_materia[1] = index2 + 1;
                        split_name_materia[2] = index + 1;
                
                        split_id_materia[1] = index2 + 1;
                        split_id_materia[2] = index + 1;

                        split_for[1] = index2 + 1;
                        split_for[2] = index + 1;

                        // Reatribuindo o nome ao campo
                        dontfeel.name = split_name_materia.join('_');
                        dontfeel.id = split_id_materia.join('_');
                        ///label_pai.htmlFor = split_for.join('_');  // Corrigido para usar htmlFor ao invés de label_pai.for
                    });

    
                });
            }
    
            
        });
    }
    

    // Atualiza a quantidade do counter 
    var counterField = document.getElementById('counter');
    if(type == 'type2' || type == 'type3'){
        counterField.value = count - 1; 
    }
    else{
        counterField.value = count; 
    }
}

function dropdownProfessores(id){
    div_open = id.parentElement.nextElementSibling;
    if (div_open.classList.contains("hidden")) {
        div_open.classList.remove("hidden");
        id.innerHTML = '-';
    } else {
        div_open.classList.add("hidden");
        id.innerHTML = '+';
    }
}

function duplicatormaximus(me, x){ 
    var copiar_div = document.querySelector('.coopyx_max');
    var new_copiar_div = copiar_div.cloneNode(true);

    // Adiciona um valor no input próximo
    count_materias = me.nextElementSibling;
    count_materias_valor = parseInt(count_materias.value) + 1;

    // Pega qual índice da supercaixa 
    father_box = me.closest(".unicogenerated-field");
    input_index = father_box.querySelector('.ihaveindex').dataset.myindexbloc;

    // Remove a classe pra não dar b.o na hora de adicionar o novovalor 
    new_copiar_div.classList.remove('coopyx_max');

    new_copiar_div.innerHTML = new_copiar_div.innerHTML.replace(/REPLACEINDEX/g, count_materias_valor);    
    new_copiar_div.innerHTML = new_copiar_div.innerHTML.replace(/newreplaceindex/g, input_index);    
    new_copiar_div.id = 'fatherfield_'+count_materias_valor +''+input_index;

    // Finalmente adiciona a div duplicada
    div_recebe = me.parentElement.parentElement;
    div_recebe.appendChild(new_copiar_div);

    // Alimenta input com quantidade de divs 
    count_materias.value = count_materias_valor;

    if(x == 0){
        superTreeUpdate();
    }
}

// Ver a senha 
function togglePasswordVisibility() {
    var passwordField = document.getElementById("2_pass");
    var eyeIcon = document.querySelector(".show-password");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        eyeIcon.classList.add("activaded");
    } else {
        passwordField.type = "password";
        eyeIcon.classList.remove("activaded");
    }
}


function validarValor(input) {
    // Convertendo o valor para número
    let valor = parseInt(input.value, 10);

    // Verificando se o valor está fora do intervalo desejado
    if (isNaN(valor) || valor < 1) {
        valor = 0; // Define o valor mínimo como 1 se for menor que 1 ou não for um número válido
    }
    // Atualiza o valor do input com o valor ajustado
    input.value = valor;
}


/// Alimenta qnt de turmas 
function selectionTurmas(eu) {
    // Obtém o elemento pai principal
    let superpai = eu.parentElement.parentElement.parentElement.parentElement;

    // Seleciona todos os elementos de input com a classe 'turmas_selection'
    let filhos_input = superpai.querySelectorAll('.turmas_selection');

    // Seleciona o input 'receive_qnt_turmas_selected'
    let receive_qnt_turmas_selected = superpai.querySelector('input[name="receive_qnt_turmas_selected"]');
        
    // Inicializa uma variável para verificar se ao menos um checkbox está checado
    let atLeastOneChecked = false;
    
    // Percorre todos os elementos filhos_input
    filhos_input.forEach(element => {
        console.log('child');
        // Verifica se o elemento está checado
        if (element.checked) {
            atLeastOneChecked = true;
            console.log('sim');
        }
    });

    // Atualiza o valor do input receive_qnt_turmas_selected para 1 se ao menos um estiver checado
    receive_qnt_turmas_selected.value = atLeastOneChecked ? 1 : '';
}


function checkturmas() {
    
    // Seleciona todos os elementos com a classe 'turmacards-area'
    let turmacards_area = document.querySelectorAll('.turmacards-area');
    
    // Itera sobre os elementos de turmacards_area
    turmacards_area.forEach(element => {
        let spanerror_turmas = element.querySelector('.spanerror_turmas');
        let receive_qnt_turmas_selected = element.querySelector('input[name="receive_qnt_turmas_selected"]');
        
        if (receive_qnt_turmas_selected.value != 1) {
            spanerror_turmas.innerHTML = '<span>Selecione ao menos uma turma</span>';
        } else {
            spanerror_turmas.innerHTML = '';
        }
        console.log(receive_qnt_turmas_selected.value);
        console.log(spanerror_turmas);
    });
}


function superTreeUpdate(){
    var count = document.getElementsByClassName('carouseltype2').length;
    var formgMaths = document.querySelectorAll('.carouseltype2:not(.fieldto-copy)');
    
    // Atualiza name/id de cada um dos campos internos 
    if(formgMaths){
        formgMaths.forEach(function(formgMath, index) {
            console.log(index);
            var span_index = formgMath.getElementsByClassName('spanex_index'); 
            var id_conteudo = formgMath.getElementsByClassName('id_conteudo'); 

            if(id_conteudo.length > 0){
                var split_id_conteudo = id_conteudo[0].name.split('_');
                split_id_conteudo[1] = index + 1;
                id_conteudo[0].name = split_id_conteudo.join('_');
            }   
            span_index[0].innerHTML = index + 1;
    
            var inputs = formgMath.querySelectorAll('.replace_index');
            inputs.forEach(function(input) {
                var label_pai = input.parentElement;
                var originalName = input.getAttribute('name');
                var originalId = input.getAttribute('id');
                var originalFor = label_pai.getAttribute('for');

    
                var newName = originalName.replace(/\d+/g, index + 1);
                var newId = originalId.replace(/\d+/g, index + 1);
                var newFor = originalFor.replace(/\d+/g, index + 1);

                label_pai.setAttribute('for', newFor); 
                input.setAttribute('name', newName); 
                input.setAttribute('id', newId); 
            });
    

            var miniform_g = formgMath.querySelectorAll('.relacional_professorxmateria');
            miniform_g.forEach(function (miniform, index2) {
                var select_materia = miniform.querySelectorAll('[name^="mateira_"]');
                var label_pai = select_materia[0].parentElement;
                var split_name_materia = select_materia[0].name.split('_');
                var split_id_materia = select_materia[0].name.split('_');
        
                var split_for = label_pai.htmlFor.split('_');  // Ajuste aqui para usar htmlFor ao invés de label_pai.for
        
                split_name_materia[1] = index2 + 1;
                split_name_materia[2] = index + 1;
        
                split_id_materia[1] = index2 + 1;
                split_id_materia[2] = index + 1;
        
                split_for[1] = index2 + 1;
                split_for[2] = index + 1;
        
                // Reatribuindo o nome ao campo
                select_materia[0].name = split_name_materia.join('_');
                select_materia[0].id = split_id_materia.join('_');
                //label_pai.htmlFor = split_for.join('_');  // Corrigido para usar htmlFor ao invés de label_pai.for

                

                // Agora pega os campos minis
                var turmas_selection = miniform.querySelectorAll('.turmas_selection');
                turmas_selection.forEach(dontfeel => {
                    var label_pai = dontfeel.parentElement;

                    var split_name_materia = dontfeel.name.split('_');
                    var split_id_materia = dontfeel.name.split('_');
                    var split_for = label_pai.htmlFor.split('_');  // Ajuste aqui para usar htmlFor ao invés de label_pai.for

                    split_name_materia[1] = index2 + 1;
                    split_name_materia[2] = index + 1;
            
                    split_id_materia[1] = index2 + 1;
                    split_id_materia[2] = index + 1;

                    split_for[1] = index2 + 1;
                    split_for[2] = index + 1;

                    // Reatribuindo o nome ao campo
                    dontfeel.name = split_name_materia.join('_');
                    dontfeel.id = split_id_materia.join('_');
                    // label_pai.htmlFor = split_for.join('_');  // Corrigido para usar htmlFor ao invés de label_pai.for
                });
            });
            
        });
    }
    

    // Atualiza a quantidade do counter 
    var counterField = document.getElementById('counter');
    counterField.value = count - 1; 
}


/// Get array profers
function montarArray() {
    var grupos_dados = [];
    var formElements = document.querySelectorAll('#repeaterbody-line > .carouseltype2');

    formElements.forEach(function(formElement) {
        var nomeProfessor = formElement.querySelector('[name^="nprofessor_"]').value;
        var idProfessor = formElement.querySelector('[name^="id_professor_"]').value;
        var preferencia = formElement.querySelector('[name^="preferencia_"]').value;
        var idMaterias = formElement.querySelectorAll('[name^="mateira_"]');
        
        var materias = [];

        idMaterias.forEach(function(idMateria, index) {
            var idMat = idMateria.value;
            var blocoturmas = formElement.querySelectorAll('.relacional_professorxmateria')[index];
            var turmas = [];

            blocoturmas.querySelectorAll('.uniqueturma-area').forEach(function(blocosinputs) {
                var checkbox = blocosinputs.querySelector('[name^="turmas_"]');
                
                if (checkbox && checkbox.checked) {
                    var qntmax = blocosinputs.querySelector('[name^="qntmax_"]').value;
                    
                    turmas.push({
                        "id_turma": checkbox.value,
                        "nome_turma": checkbox.value,
                        "qnt_max_aulas": qntmax
                    });
                }
            });

            materias.push({
                "id_materia": idMat,
                "preferencia": preferencia,
                "turmas": turmas
            });
        });

        grupos_dados.push({
            "nome_professor": nomeProfessor,
            "id_professor": idProfessor,
            "materias": materias
        });
    });

    var d = document.getElementById('d');
    d.value = '';
    d.value = JSON.stringify(grupos_dados);
    
    fakeclick = document.getElementById('fakeclick');
    if(d.value != ''){
        fakeclick.click();
    }
}


// Labelors
document.addEventListener('DOMContentLoaded', (event) => {
    const labels = document.querySelectorAll('.unicacheck_fielbubble');

    labels.forEach(label => {
        label.addEventListener('click', (e) => {
            const input = label.querySelector('input[type="checkbox"]');
            if (input) {
                input.checked = !input.checked;
            }
        });
    });
});


// Check duplicidade de nome do professor 
function verificarDuplicidade() {
    // Seleciona todos os inputs com a classe 'name_profe'
    const nameProfeInputs = document.querySelectorAll('.name_profe');
    let duplicado = false;

    // Itera sobre cada input para verificar duplicidade
    nameProfeInputs.forEach(input => {
        // Limpa as classes de erro
        input.classList.remove('error_field');

        // Verifica se há algum outro input com o mesmo valor
        nameProfeInputs.forEach(outroInput => {
            if (outroInput !== input && outroInput.value === input.value && input.value.trim() !== '') {
                duplicado = true;
                input.classList.add('error_field');
            }
        });
    });

    // Seleciona o botão de ID 'savetudo'
    const fielderror = document.querySelector('.error-name-profe');
    const botaoSalvar = document.getElementById('savetudo');
    if (duplicado) {
        // Desabilita o botão se houver duplicidade
        botaoSalvar.disabled = true;
        fielderror.innerHTML = '<span>Não é permitido que haja dois professores com o mesmo nome.</span>';
    } else {
        // Habilita o botão se não houver duplicidade
        botaoSalvar.disabled = false;
        fielderror.innerHTML = '';
    }
}


// Check duplicidade
function checkdupliciade() {
    // Seleciona todos os inputs com a classe 'name_profe'
    const nameProfeInputs = document.querySelectorAll('.ckduplicidade');
    let duplicado = false;

    // Itera sobre cada input para verificar duplicidade
    nameProfeInputs.forEach(input => {
        // Limpa as classes de erro
        input.classList.remove('error_field');

        // Verifica se há algum outro input com o mesmo valor
        nameProfeInputs.forEach(outroInput => {
            if (outroInput !== input && outroInput.value === input.value && input.value.trim() !== '') {
                duplicado = true;
                input.classList.add('error_field');
            }
        });
    });

    // Seleciona o botão de ID 'savetudo'
    const fielderror = document.querySelector('.error-name-profe');
    const botaoSalvar = document.getElementById('savetudo');
    if (duplicado) {
        // Desabilita o botão se houver duplicidade
        botaoSalvar.disabled = true;
        fielderror.innerHTML = '<span>Não é permitido valores iguais.</span>';
    } else {
        // Habilita o botão se não houver duplicidade
        botaoSalvar.disabled = false;
        fielderror.innerHTML = '';
    }
}

// Checar a disponibilidade de horários
function checkDispon() {
    
    var looper_days = document.querySelectorAll('.looper-days');
    var allValid = true; // Variável para controlar se todas as divs têm pelo menos um checkbox marcado

    looper_days.forEach(function(looper_day) {
        var inputs = looper_day.querySelectorAll('input[type="checkbox"]');
        var isChecked = Array.from(inputs).some(function(input) {
            return input.checked; // Verifica se algum checkbox está marcado
        });

        if (!isChecked) {
            allValid = false; // Se nenhum checkbox estiver marcado, invalida
            looper_day.classList.add('error'); // Adiciona a classe à div vazia
        } else {
            looper_day.classList.remove('error'); // Remove a classe caso tenha checkbox marcado
        }
    });

    if (!allValid) {
        $('#receive_error').html('Existem registros em branco.');
        return false; // Impede o fluxo
    }

    var fakeclick = document.getElementById('fakeclick');
    // Só aciona o fakeclick se não encontrou erro
    $('#receive_error').html('');
    fakeclick.click();
    
    return true; 
}
