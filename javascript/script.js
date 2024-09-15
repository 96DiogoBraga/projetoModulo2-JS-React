async function createTodoItem() {
    let novoItem = {
        id: items.length + 1,
        descricao: document.getElementById('novoItem').value,
        completo: false
    };

    let response = await fetch('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify({
            name: novoItem.descricao,
            owner: 'Diogo'
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    console.log(await response.json());
    adicionarItem(novoItem);
};

async function pegarIdPeloNome(name){
    try {
        let response = await fetch('http://localhost:3000/api/todos');
        let itensToDo = await response.json();
        let item = itensToDo.find(item => item.name === name);
        return item ? item.id : null;
    } catch(error){
        console.error('Erro ao buscar o ID pelo nome:', error);
        return null;
    }
};

async function deletarItem(){
    let apagarItem = document.getElementById('apagarItem').value;

    let idDoItem = await pegarIdPeloNome(apagarItem);

    try {
        let response = await fetch(`http://localhost:3000/api/todos/${idDoItem}`, {
            method: 'DELETE'
        });

        if(response.ok){
            let lista = document.getElementById('lista');
            let itemParaExcluir = Array.from(lista.getElementsByTagName('li')).find(li =>{
                let textoDoItem = li.querySelector('p').innerText;
                return textoDoItem === apagarItem;
            });

            if(itemParaExcluir){
                lista.removeChild(itemParaExcluir);
                console.log('Item excluído com sucesso!');
            }
        }
    } catch(error){
        console.error('Erro ao fazer a requisição:', error);
    }
};

async function atualizarStatusDoItem(idDoItem, completo){
    try{
        let response = await fetch(`http://localhost:3000/api/todos/${idDoItem}`,{
            method: 'PATCH',
            body: JSON.stringify({ done: completo }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(response.ok){
            console.log('Status do item atualizado com sucesso!');
        }
    } catch(error){
        console.error('Erro ao fazer requisição', error);
    };
};

async function editarItem(elementoDoItem, idDoItem){
    let input = elementoDoItem.querySelector('input[name="editarInput"]');
    let novoNome = input.value.trim();

    if(novoNome === ''){
        alert('A edição não pode ficar vazia');
        return
    }

    try{
        let response = await fetch(`http://localhost:3000/api/todos/${idDoItem}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: novoNome }),
            headers:{
                'Content-Type': 'application/json'
            }
        });

        if(response.ok){
            let textoDoItem = elementoDoItem.querySelector('p');
            textoDoItem.innerText = novoNome;
            
            let botaoSalvar = elementoDoItem.querySelector('button[name="botaoSalvar"]');
            botaoSalvar.reomve();
            
            let botaoEditar = elementoDoItem.querySelector('button[name="botaoEditar"]');
            botaoEditar.style.display = 'inline-block';

            console.log('Item atualizado com sucesso!');
        }
    } catch(error){
        console.error('Erro ao fazer a requisção', error);
    }
};

function adicionarItem(novoItem){
    let itemDaLista = document.getElementById('lista');

    if (Array.from(itemDaLista.getElementsByTagName('li')).some(li => {
            let textoDoItem = li.querySelector('p').innerText;
            return textoDoItem === novoItem.descricao
        })) {

        return;
    }

    let elementoDoItem = document.createElement('li');
    elementoDoItem.style.display = 'flex';
    elementoDoItem.style.alignItems = 'center';
    elementoDoItem.style.justifyContent = 'space-between';

    let textoDoItem = document.createElement('p');
    textoDoItem.innerText = novoItem.descricao;

    if(novoItem.completo){
        textoDoItem.style.textDecoration = 'line-through red'
    }

    let completarCheckbox = document.createElement('input');
    completarCheckbox.setAttribute('type', 'checkbox');
    completarCheckbox.checked = novoItem.completo;
    completarCheckbox.className = 'checkboxes';

    completarCheckbox.addEventListener('change', () =>{
        if(completarCheckbox.checked){
            textoDoItem.style.textDecoration = 'line-through red';
        } else{
            textoDoItem.style.textDecoration = 'none';
        }

        marcarComoCompletado(novoItem, completarCheckbox.checked);
        atualizarStatusDoItem(novoItem.id, completarCheckbox.checked);
    })

    let divTextoECheckbox = document.createElement('div');
    divTextoECheckbox.style.display = ('flex');
    divTextoECheckbox.style.alignItems = ('center');
    divTextoECheckbox.appendChild(completarCheckbox);
    divTextoECheckbox.appendChild(textoDoItem);

    let botaoEditar = document.createElement('button');
    botaoEditar.innerText = 'Editar';
    botaoEditar.name = 'botaoEditar';
    botaoEditar.addEventListener('click', () => {
        if(!elementoDoItem.querySelector('input[name="editarInput"]')){
            let input = document.createElement('input');
            input.setAttribute('type', 'text');
            input.setAttribute('name', 'editarInput');
            input.value = textoDoItem.innerText;

            let botaoSalvar = document.createElement('button');
            botaoSalvar.innerText = ('Salvar');
            botaoSalvar.name = ('botaoSalvar');
            botaoSalvar.addEventListener('click', ()=>{
                editarItem(elementoDoItem, novoItem.id);

                elementoDoItem.appendChild(input);
                elementoDoItem.appendChild(botaoSalvar);
                botaoEditar.style.display = 'none';
            })
        }
    });

    elementoDoItem.appendChild(divTextoECheckbox);
    elementoDoItem.appendChild(botaoEditar);
    
    itemDaLista.appendChild(elementoDoItem);
};

async function carregarItensToDo(){
    let response = await fetch(`http://localhost:3000/api/todos`);
    let itensToDo = await response.json();

    let itensDaLista = document.getElementById('lista');
    itensDaLista.innerHTML = '';

    itensToDo.forEach(item => {
        let itemToDo = {
            descricao: item.name,
            completo: item.done,
            id: item.id
        };

        adicionarItem(itemToDo)
    });
};

function marcarComoCompletado(item, completo){
    item.completo = completo;
    items[item.id - 1] = item;
    //localStorage.setItem('items', JSON.stringify(items));
};

window.onload = carregarItensToDo;