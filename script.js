document.addEventListener('DOMContentLoaded', function () {
    const monthsBr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const tableDays = document.getElementById('dias');
    let mes;
    let ano;

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

    let tasks = [];

    function GetDaysCalendar(mes, ano) {
        document.getElementById('mes').textContent = monthsBr[mes];
        document.getElementById('ano').textContent = ano;

        tableDays.innerHTML = '';

        let firstDayOfWeek = new Date(ano, mes, 1).getDay();
        let getLastDayThisMonth = new Date(ano, mes + 1, 0).getDate();
        let getLastDayPrevMonth = new Date(ano, mes, 0).getDate();

        let now = new Date();
        let diaAtual = now.getDate();

        let day = 1;
        let prevMonthDay = getLastDayPrevMonth - firstDayOfWeek + 1;
        for (let i = 0; i < 6; i++) {
            let row = tableDays.insertRow();
            for (let j = 0; j < 7; j++) {
                let cell = row.insertCell();
                if (i === 0 && j < firstDayOfWeek) {
                    cell.textContent = prevMonthDay++;
                    cell.classList.add('mes-anterior');
                } else if (day > getLastDayThisMonth) {
                    cell.textContent = day - getLastDayThisMonth;
                    cell.classList.add('proximo-mes');
                    day++;
                } else {
                    cell.textContent = day;
                    cell.dataset.day = day;
                    cell.dataset.month = mes + 1;
                    cell.dataset.year = ano;

                    if (mes === now.getMonth() && ano === now.getFullYear() && day === diaAtual) {
                        cell.classList.add('dia-atual');
                    }

                    const feriado = feriadosNacionais[`${mes + 1}-${day}`];
                    if (feriado) {
                        cell.innerHTML += `<br><span class="feriado">${feriado}</span>`;
                        cell.classList.add('holiday'); // Adicione a classe de estilo aos dias de feriado
                    }

                    const taskList = tasks.filter(task =>
                        task.eventDate === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    );

                    // Dentro da função GetDaysCalendar
                    taskList.forEach(task => {
                        const taskElement = document.createElement('div');
                        taskElement.className = 'task';
                        taskElement.textContent = task.eventTitle;
                        taskElement.style.backgroundColor = task.eventColor;
                        taskElement.addEventListener('click', () => {
                            // Preencher os campos do editModal com os detalhes da tarefa selecionada
                            document.getElementById('eventTitleEdit').value = task.eventTitle;
                            document.getElementById('eventDateEdit').value = task.eventDate;
                            document.getElementById('eventDescriptionEdit').value = task.eventDescription;
                            document.getElementById('selectedColorEdit').value = task.eventColor;

                            // Abrir o editModal
                            document.getElementById('editModal').style.display = 'block';
                        });
                        cell.appendChild(taskElement);
                    });


                    cell.addEventListener('dblclick', function () {
                        openModal(day, mes + 1, ano, day, mes + 1, ano);
                    });
                    day++;
                }
            }
        }
    }

    function updateCalendar() {
        if (mes < 0) {
            mes = 11;
            ano--;
        } else if (mes > 11) {
            mes = 0;
            ano++;
        }
        GetDaysCalendar(mes, ano);
    }

    let now = new Date();
    mes = now.getMonth();
    ano = now.getFullYear();
    updateCalendar();

    document.getElementById('btn_prox').addEventListener('click', function () {
        mes++;
        updateCalendar();
    });

    document.getElementById('btn_ant').addEventListener('click', function () {
        mes--;
        updateCalendar();
    });

    document.getElementById('btn_hoje').addEventListener('click', function () {
        let now = new Date();
        mes = now.getMonth();
        ano = now.getFullYear();
        updateCalendar();
    });

    document.getElementById('btn_agd').addEventListener('click', function () {
        const tasksModal = document.getElementById('tasksModal');
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = ''; // Limpa o conteúdo da lista de tarefas antes de adicionar as novas tarefas


        //Model com todas as tarefas criadas
        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'agenda-task';
            taskElement.innerHTML = `
                <h3><strong>Título:</strong>${task.eventTitle}</h3>
                <p><strong>Data Início:</strong> ${task.eventDate}</p>
                <p><strong>Data Fim:</strong> ${task.eventDateFim}</p>
                <p><strong>Cor:</strong> ${task.eventColor}</p>
            `;
            tasksList.appendChild(taskElement);
        });


        // Exibe o modal com todas as tarefas
        tasksModal.style.display = 'block';

        const closeTasksModalButton = document.getElementById('closeTasksModalButton');
        closeTasksModalButton.addEventListener('click', function () {
            const tasksModal = document.getElementById('tasksModal');
            tasksModal.style.display = 'none';
        });


    });

    const modal = document.getElementById('eventModal');
    const span = document.getElementsByClassName('close')[0];

    span.onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = option.style.backgroundColor;
            document.getElementById('selectedColor').value = selectedColor;

            // Remova a classe 'selected' de todos os quadrados de cor
            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            });

            // Adicione a classe 'selected' apenas ao quadrado de cor clicado
            option.classList.add('selected');
            option.querySelector('.color-checkmark').style.visibility = 'visible';
        });
    });


    function openModal(day, month, year) {
        modal.style.display = 'block';
        const now = new Date();
        document.getElementById('taskDay').value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        document.getElementById('eventDate').value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }


    document.addEventListener('DOMContentLoaded', function () {
        openModal(now.getDate(), now.getMonth() + 1, now.getFullYear());

    });



    document.getElementById('addEventForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const taskDay = document.getElementById('taskDay').value;
        const eventTitle = document.getElementById('eventTitle').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventDescription = document.getElementById('eventDescription').value;
        const eventColor = document.getElementById('selectedColor').value; // Use a cor selecionada
        tasks.push({ taskDay, eventTitle, eventDate, eventDescription, eventColor });

        // Fechar o modal
        modal.style.display = 'none';

        // Atualizar o calendário
        updateCalendar();

        // Limpar os campos do formulário
        document.getElementById('taskDay').value = '';
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventDescription').value = '';
        document.getElementById('selectedColor').value = '';

        // Remover a seleção de cor
        colorOptions.forEach(opt => {
            opt.classList.remove('selected');
            opt.querySelector('.color-checkmark').style.visibility = 'hidden';
        });
    });

});