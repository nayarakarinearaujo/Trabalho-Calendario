document.addEventListener('DOMContentLoaded', function () {

    const monthsBr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    const tableDays = document.getElementById('dias');

    // Variáveis para armazenar o mês e o ano atual
    let mes;
    let ano;

    // Objeto contendo os feriados nacionais
    const feriadosNacionais = {
        '1-1': ' Confraternização Universal',
        '4-21': ' Tiradentes',
        '5-1': ' Dia do Trabalho',
        '9-7': ' Independência do Brasil',
        '10-12': ' Nossa Senhora Aparecida',
        '11-2': ' Finados',
        '11-15': ' Proclamação da República',
        '12-25': ' Natal'
    };

    let tasks = [];

    // Variável para armazenar o modal de edição
    let editModal;

    // Função para obter os dias do calendário para o mês e ano especificados
    function getDaysCalendar(mes, ano) {
        // Obtém os elementos HTML que exibem o mês e o ano
        const mesElement = document.getElementById('mes');
        const anoElement = document.getElementById('ano');

        // Atualiza o texto dos elementos do mês e do ano
        if (mesElement && anoElement) {
            mesElement.textContent = monthsBr[mes];
            anoElement.textContent = ano;
        }

        // Limpa a tabela de dias
        tableDays.innerHTML = '';

        // Calcula o primeiro dia da semana e o último dia do mês
        const firstDayOfWeek = new Date(ano, mes, 1).getDay();
        const getLastDayThisMonth = new Date(ano, mes + 1, 0).getDate();
        const getLastDayPrevMonth = new Date(ano, mes, 0).getDate();

        // Obtém a data atual
        const now = new Date();
        const diaAtual = now.getDate();

        // Inicializa o dia atual do calendário
        let day = 1;
        let prevMonthDay = getLastDayPrevMonth - firstDayOfWeek + 1;

        // Preenche a tabela de dias com os dias do mês atual
        for (let i = 0; i < 6; i++) {
            const row = tableDays.insertRow();
            for (let j = 0; j < 7; j++) {
                const cell = row.insertCell();
                cell.innerHTML = '';
                if (i === 0 && j < firstDayOfWeek) {

                    // Preenche os dias do mês anterior
                    cell.textContent = prevMonthDay++;
                    cell.classList.add('mes-anterior');

                } else if (day > getLastDayThisMonth) {

                    // Preenche os dias do próximo mês
                    cell.textContent = day - getLastDayThisMonth;
                    cell.classList.add('proximo-mes');
                    day++;

                } else {
                    // Preenche os dias do mês atual
                    cell.textContent = day;
                    cell.dataset.day = day;
                    cell.dataset.month = mes + 1;
                    cell.dataset.year = ano;

                    // Adiciona classe para o dia atual
                    if (mes === now.getMonth() && ano === now.getFullYear() && day === diaAtual) {
                        cell.classList.add('dia-atual');
                    }

                    // Adiciona feriado, se houver
                    const feriado = feriadosNacionais[`${mes + 1}-${day}`];
                    if (feriado) {
                        const span = document.createElement('span');
                        span.classList.add('feriado');
                        span.textContent = feriado;
                        cell.appendChild(span);
                        cell.classList.add('holiday');
                    }

                    // Adiciona tarefas, se houver
                    const taskList = tasks.filter(task => task.eventDate === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ||
                        task.eventDateFim === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);

                    taskList.forEach(task => {
                        const taskElement = document.createElement('div');
                        taskElement.classList.add('task');
                        taskElement.textContent = task.eventTitle;
                        taskElement.style.backgroundColor = task.eventColor;
                        cell.appendChild(taskElement);

                        taskElement.addEventListener('click', function (event) {
                            event.stopPropagation();
                            openEditModal(task);
                        });
                    });

                    cell.addEventListener('dblclick', function () {
                        if (cell.textContent.trim() !== '') {
                            openModal(cell.dataset.day, cell.dataset.month, cell.dataset.year);
                        }
                    });


                    day++;
                }
            }
        }
    }


    function openModal(day, month, year) {
        const modal = document.getElementById('eventModal');
        if (!modal) return;

        modal.style.display = 'block';

        const currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const nextHour = now.getHours() + 1;
        const nextTime = `${String(nextHour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; // Hora atual + 1 hora

        document.getElementById('taskDay').value = currentDate;  
        document.getElementById('eventDate').value = currentDate;
        document.getElementById('startTime').value = currentTime;
        document.getElementById('eventEndDate').value = currentDate; 
        document.getElementById('endTime').value = nextTime; 

        // Evento de envio do formulário de adição de tarefas
        const addEventForm = document.getElementById('addEventForm');
        addEventForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const taskDay = document.getElementById('taskDay').value;

            const eventTitle = document.getElementById('eventTitle').value;
            const eventDate = document.getElementById('eventDate').value;
            const startTime = document.getElementById('startTime').value;
            const eventEndDate = document.getElementById('eventEndDate').value;
            const endTime = document.getElementById('endTime').value;
            const eventDescription = document.getElementById('eventDescription').value;
            const eventColor = document.getElementById('selectedColor').value;

            tasks.push({ eventDate, eventTitle, startTime, eventDateFim: eventEndDate, endTime, eventDescription, eventColor });
            console.log('Tasks:', tasks);

            modal.style.display = 'none';
            getDaysCalendar(mes, ano);

            document.getElementById('taskDay').value = '';
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('startTime').value = '';
            document.getElementById('eventEndDate').value = '';
            document.getElementById('endTime').value = '';
            document.getElementById('eventDescription').value = '';
            document.getElementById('selectedColorEdit').value = task.eventColor;

            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            });
        });

        const closeEditModalButton = document.getElementById('btn_close');
        if (closeEditModalButton) {
            closeEditModalButton.addEventListener('click', function () {
                const editModal = document.getElementById('editModal');
                if (editModal) {
                    editModal.style.display = 'none';
                }
            });
        }
    }

    // Evento para fechar o modal de adição de tarefas
    const modal = document.getElementById('eventModal');
    const span = document.getElementsByClassName('close')[0];

    if (span) {
        span.onclick = function () {
            if (modal) {
                modal.style.display = 'none';
            }
        };
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Evento de clique nos botões de cores no modal de adição de tarefas
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = option.style.backgroundColor;
            document.getElementById('selectedColor').value = selectedColor;

            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            });

            option.classList.add('selected');
            option.querySelector('.color-checkmark').style.visibility = 'visible';
        });
    });

    function openEditModal(task) {
        const editModal = document.getElementById('editModal');
        if (!editModal) return;

        // Atualize o conteúdo do modal com os dados da tarefa selecionada
        document.getElementById('eventTitleEdit').value = task.eventTitle;
        document.getElementById('eventDateEdit').value = task.eventDate;
        document.getElementById('startTimeEdit').value = task.startTime;
        document.getElementById('eventEndDateEdit').value = task.eventEndDate;
        document.getElementById('endTimeEdit').value = task.endTime;
        document.getElementById('eventDescriptionEdit').value = task.eventDescription;

        // Defina a cor selecionada
        const selectedColorInput = document.getElementById('selectedColorEdit');
        selectedColorInput.value = task.eventColor;

        // Abra o modal de edição
        editModal.style.display = 'block';

        // Evento para salvar as alterações no formulário de edição
        const formEdit = document.getElementById('editEventForm');
        formEdit.onsubmit = function (e) {
            e.preventDefault();
            task.eventTitle = document.getElementById('eventTitleEdit').value;
            task.eventDate = document.getElementById('eventDateEdit').value;
            task.startTime = document.getElementById('startTimeEdit').value;
            task.eventEndDate = document.getElementById('eventEndDateEdit').value;
            task.endTime = document.getElementById('endTimeEdit').value;
            task.eventDescription = document.getElementById('eventDescriptionEdit').value;
            task.eventColor = selectedColorInput.value;

            saveTasksToLocalStorage();
            getDaysCalendar(mes, ano);
            closeEditModal();
        };

        // Evento para excluir a tarefa
        const deleteButton = document.querySelector('.btn_del');
        deleteButton.onclick = function () {
            tasks = tasks.filter(t => t !== task);
            saveTasksToLocalStorage();
            getDaysCalendar(mes, ano);
            closeEditModal();
        };

        // Evento para fechar o modal de edição
        document.getElementById('closeEditModalButton').onclick = function () {
            closeEditModal();
        };

        document.getElementById('btn_close').onclick = function () {
            closeEditModal();
        };

        function closeEditModal() {
            editModal.style.display = 'none';
        }

        // Atualiza a cor da tarefa no calendário após edição
        updateTaskColorInCalendar(task);
    }

    function updateTaskColorInCalendar(task) {
        const calendarCells = document.querySelectorAll('#dias td');
        calendarCells.forEach(cell => {
            const taskElements = cell.querySelectorAll('.task');
            taskElements.forEach(element => {
                cell.removeChild(element);
            });
    
            const taskList = tasks.filter(t => t.eventDate === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(cell.textContent).padStart(2, '0')}` ||
                t.eventDateFim === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(cell.textContent).padStart(2, '0')}`);
    
            taskList.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('task');
                taskElement.textContent = task.eventTitle;
                taskElement.style.backgroundColor = task.eventColor;
    
                cell.appendChild(taskElement);
    
                taskElement.addEventListener('click', function (event) {
                    event.stopPropagation();
                    openEditModal(task);
                });
            });
        });
    }
    

    // Evento de clique nos botões de cores no modal de edição
    const colorOptionsEdit = document.querySelectorAll('.color-option-edit');
    colorOptionsEdit.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = option.style.backgroundColor;
            const selectedColorInput = document.getElementById('selectedColorEdit');
            selectedColorInput.value = selectedColor;

            colorOptionsEdit.forEach(opt => {
                opt.classList.remove('selected');
            });

            option.classList.add('selected');
        });
    });



    function saveTasksToLocalStorage() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    }

    //------------------------------------

    function showAllTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        // Criar tabela
        const table = document.createElement('table');
        table.classList.add('tasks-table');

        // Criar cabeçalho da tabela
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        const headers = ['Título', 'Data', 'Hora de Início', 'Cor'];
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Criar corpo da tabela
        const tbody = document.createElement('tbody');

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.classList.add('task-item');

            const taskTitleCell = document.createElement('td');
            taskTitleCell.textContent = task.eventTitle;
            row.appendChild(taskTitleCell);

            const taskDateCell = document.createElement('td');
            taskDateCell.textContent = task.eventDate;
            row.appendChild(taskDateCell);

            const taskStartTimeCell = document.createElement('td');
            taskStartTimeCell.textContent = task.startTime;
            row.appendChild(taskStartTimeCell);

            const taskColorCell = document.createElement('td');
            taskColorCell.classList.add('color-cell');
            const colorSpan = document.createElement('div');
            colorSpan.style.backgroundColor = task.eventColor;
            colorSpan.style.width = '20px';
            colorSpan.style.height = '20px';
            colorSpan.style.display = 'inline-block';
            taskColorCell.appendChild(colorSpan);
            row.appendChild(taskColorCell);

            row.addEventListener('click', function () {
                openEditModal(task);
            });

            tbody.appendChild(row);
        });


        table.appendChild(tbody);
        tasksList.appendChild(table);
    }

    //------------------------------------------

    // Evento para o botão 'Anterior' do calendário
    document.getElementById('btn_ant').addEventListener('click', function () {
        mes = (mes - 1 + 12) % 12;
        if (mes === 11) ano--;
        getDaysCalendar(mes, ano);
    });

    // Evento para o botão 'Próximo' do calendário
    document.getElementById('btn_prox').addEventListener('click', function () {
        mes = (mes + 1) % 12;
        if (mes === 0) ano++;
        getDaysCalendar(mes, ano);
    });

    // Evento para o botão 'Hoje' do calendário
    document.getElementById('btn_hoje').addEventListener('click', function () {
        const hoje = new Date();
        mes = hoje.getMonth();
        ano = hoje.getFullYear();
        getDaysCalendar(mes, ano);
    });

    // Evento para o botão 'Mês' do calendário
    document.getElementById('btn_mes').addEventListener('click', function () {
        document.getElementById('calendario').classList.remove('hidden');
        document.getElementById('tasksContainer').classList.add('hidden');
    });

    // Evento para o botão 'Agenda'
    document.getElementById('btn_agd').addEventListener('click', function () {
        showAllTasks();
        document.getElementById('calendario').classList.add('hidden');
        document.getElementById('tasksContainer').classList.remove('hidden');
    });

    // Carrega tarefas do localStorage
    loadTasksFromLocalStorage();

    // Inicializa calendário com o mês e ano atual
    const hoje = new Date();
    mes = hoje.getMonth();
    ano = hoje.getFullYear();
    getDaysCalendar(mes, ano);
});

