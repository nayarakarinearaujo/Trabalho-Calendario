// Quando o conteúdo do DOM estiver carregado, executa o código dentro desta função
document.addEventListener('DOMContentLoaded', function () {

    // Array contendo os nomes dos meses em português
    const monthsBr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    // Elemento HTML da tabela de dias do calendário
    const tableDays = document.getElementById('dias');

    // Variáveis para armazenar o mês e o ano atual
    let mes;
    let ano;

    // Objeto contendo os feriados nacionais
    const feriadosNacionais = {
        '1-1': 'Confraternização Universal',
        '4-21': 'Tiradentes',
        '5-1': 'Dia do Trabalho',
        '9-7': 'Independência do Brasil',
        '10-12': 'Nossa Senhora Aparecida',
        '11-2': 'Finados',
        '11-15': 'Proclamação da República',
        '12-25': 'Natal'
    };

    // Array para armazenar as tarefas do calendário
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

                    // Adiciona evento de clique duplo para abrir o modal de adição de tarefas
                    cell.addEventListener('dblclick', function () {
                        openModal(day, mes + 1, ano);
                    });

                    day++;
                }
            }
        }
    }

    // Função para abrir o modal de edição de uma tarefa
    function openEditModal(task) {
        editModal = document.getElementById('editModal');
        if (!editModal) return;

        // Preenche os campos do modal de edição com os dados da tarefa
        document.getElementById('eventTitleEdit').value = task.eventTitle;
        document.getElementById('eventDateEdit').value = task.eventDate;
        document.getElementById('startTimeEdit').value = task.startTime;
        document.getElementById('eventEndDateEdit').value = task.eventDateFim;
        document.getElementById('endTimeEdit').value = task.endTime;
        document.getElementById('eventDescriptionEdit').value = task.eventDescription;
        document.getElementById('selectedColorEdit').value = task.eventColor;

        // Atualiza a seleção de cor no modal de edição
        const colorOptionsEdit = document.querySelectorAll('.color-option-edit');
        colorOptionsEdit.forEach(opt => {
            if (opt.style.backgroundColor === task.eventColor) {
                opt.classList.add('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'visible';
            } else {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            }
        });

        // Armazena o id da tarefa no modal de edição
        editModal.dataset.taskId = task.eventDate;
        editModal.style.display = 'block';
    }

    // Evento de clique no botão para fechar o modal de edição
    const closeEditModalButton = document.getElementById('closeEditModalButton');
    if (closeEditModalButton) {
        closeEditModalButton.addEventListener('click', function () {
            editModal = document.getElementById('editModal');
            if (editModal) {
                editModal.style.display = 'none';
            }
        });
    }

    // Função para deletar uma tarefa
    function deleteTask() {
        editModal = document.getElementById('editModal');
        if (!editModal) return;

        // Obtém o id da tarefa a ser deletada
        const taskId = editModal.dataset.taskId;

        // Encontra o índice da tarefa no array de tarefas
        const index = tasks.findIndex(task => task.eventDate === taskId);

        // Remove a tarefa do array
        if (index !== -1) {
            tasks.splice(index, 1);
            console.log('Tarefa apagada:', tasks);
            editModal.style.display = 'none';
            updateCalendar();
        }
    }

    // Evento de clique no botão para deletar uma tarefa
    const deleteTaskButton = document.querySelector('.btn_del');
    if (deleteTaskButton) {
        deleteTaskButton.addEventListener('click', function () {
            deleteTask();
        });
    }

    // Evento de clique nos botões de cores no modal de edição
    const colorOptionsEdit = document.querySelectorAll('.color-option-edit');
    const selectedColorEdit = document.getElementById('selectedColorEdit');
    colorOptionsEdit.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = option.style.backgroundColor;
            selectedColorEdit.value = selectedColor;

            colorOptionsEdit.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            });

            option.classList.add('selected');
            option.querySelector('.color-checkmark').style.visibility = 'visible';
        });
    });

    // Evento para fechar o modal de edição ao clicar fora dele
    window.addEventListener('click', function (event) {
        editModal = document.getElementById('editModal');
        if (editModal && event.target == editModal) {
            editModal.style.display = 'none';
        }
    });

    // Função para atualizar o calendário
    function updateCalendar() {
        if (mes < 0) {
            mes = 11;
            ano--;
        } else if (mes > 11) {
            mes = 0;
            ano++;
        }
        getDaysCalendar(mes, ano);
    }

    // Inicializa o calendário com o mês e ano atuais
    const now = new Date();
    mes = now.getMonth();
    ano = now.getFullYear();
    updateCalendar();

    // Eventos de navegação do calendário (próximo mês, mês anterior, hoje)
    const btnProx = document.getElementById('btn_prox');
    const btnAnt = document.getElementById('btn_ant');
    const btnHoje = document.getElementById('btn_hoje');
    const btnAgd = document.getElementById('btn_agd');

    if (btnProx) {
        btnProx.addEventListener('click', function () {
            mes++;
            updateCalendar();
        });
    }

    if (btnAnt) {
        btnAnt.addEventListener('click', function () {
            mes--;
            updateCalendar();
        });
    }

    if (btnHoje) {
        btnHoje.addEventListener('click', function () {
            mes = now.getMonth();
            ano = now.getFullYear();
            updateCalendar();
        });
    }

    // Evento para abrir o modal de exibição de tarefas agendadas
    if (btnAgd) {
        btnAgd.addEventListener('click', function () {
            const tasksModal = document.getElementById('tasksModal');
            const tasksList = document.getElementById('tasksList');
            if (!tasksModal || !tasksList) return;

            tasksList.innerHTML = '';

            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('agenda-task');
                taskElement.innerHTML = `
                    <h3><strong>Título:</strong> ${task.eventTitle}</h3>
                    <p><strong>Data Início:</strong> ${task.eventDate}</p>
                    <p><strong>Horário Início:</strong> ${task.startTime}</p>
                    <p><strong>Data Fim:</strong> ${task.eventDateFim}</p>
                    <p><strong>Horário Fim:</strong> ${task.endTime}</p>
                    <div class="color-box" style="background-color: ${task.eventColor};"></div>
                    `;
                tasksList.appendChild(taskElement);
            });

            tasksModal.style.display = 'block';
        });

        // Evento para fechar o modal de exibição de tarefas agendadas
        const tasksModal = document.getElementById('tasksModal');
        const closeTasksModalButton = document.querySelector('.close-tasks-modal');

        if (closeTasksModalButton) {
            closeTasksModalButton.addEventListener('click', function () {
                if (tasksModal) {
                    tasksModal.style.display = 'none';
                }
            });
        }

        window.addEventListener('click', function (event) {
            if (event.target == tasksModal) {
                tasksModal.style.display = 'none';
            }
        });

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

    // Função para abrir o modal de adição de tarefas
    function openModal(day, month, year) {
        const modal = document.getElementById('eventModal');
        if (!modal) return;

        modal.style.display = 'block';
        const now = new Date();
        const currentDateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        document.getElementById('currentDateTime').textContent = currentDateTime;

        const currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        document.getElementById('taskDay').value = currentDate;
        document.getElementById('eventDate').value = currentDate;
        document.getElementById('startTime').value = currentTime;
    }

    // Evento de envio do formulário de adição de tarefas
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
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
            document.getElementById('selectedColor').value = '';

            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            });
        });
    }

    // Evento de envio do formulário de edição de tarefas
    const editEventForm = document.getElementById('editEventForm');
    if (editEventForm) {
        editEventForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const taskId = editModal.dataset.taskId;

            const eventTitle = document.getElementById('eventTitleEdit').value;
            const eventDate = document.getElementById('eventDateEdit').value;
            const startTime = document.getElementById('startTimeEdit').value;
            const eventEndDate = document.getElementById('eventEndDateEdit').value;
            const endTime = document.getElementById('endTimeEdit').value;
            const eventDescription = document.getElementById('eventDescriptionEdit').value;

            // Obtenha a cor selecionada diretamente do elemento com a classe 'selected'
            const selectedColorElement = editModal.querySelector('.selected');
            const eventColor = selectedColorElement.style.backgroundColor;

            const taskIndex = tasks.findIndex(task => task.eventDate === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex] = { eventDate, eventTitle, startTime, eventDateFim: eventEndDate, endTime, eventDescription, eventColor };
            }

            console.log('Tasks after edit:', tasks);

            editModal.style.display = 'none';
            getDaysCalendar(mes, ano);
        });
    }
});
