let notes = JSON.parse(localStorage.getItem('notes_app')) || [];
let activeId = null;
let saveTimer = null;

const noteList = document.getElementById('noteList');
const searchInput = document.getElementById('searchInput');
const editor = document.getElementById('editor');
const placeholder = document.getElementById('placeholder');
const noteTitle = document.getElementById('noteTitle');
const noteBody = document.getElementById('noteBody');
const charCount = document.getElementById('charCount');
const lastSaved = document.getElementById('lastSaved');
const newNoteBtn = document.getElementById('newNoteBtn');
const deleteNoteBtn = document.getElementById('deleteNoteBtn');

function save() {
  localStorage.setItem('notes_app', JSON.stringify(notes));
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderList(filter = '') {
  const term = filter.toLowerCase();
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(term) || n.body.toLowerCase().includes(term)
  );

  noteList.innerHTML = '';
  filtered
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach(note => {
      const li = document.createElement('li');
      li.className = 'note-item' + (note.id === activeId ? ' active' : '');
      li.innerHTML = `
        <div class="note-title">${note.title || 'Untitled'}</div>
        <div class="note-preview">${note.body.slice(0, 60) || 'No content'}</div>
        <div class="note-date">${formatDate(note.updatedAt)}</div>
      `;
      li.addEventListener('click', () => openNote(note.id));
      noteList.appendChild(li);
    });
}

function openNote(id) {
  activeId = id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  editor.classList.remove('hidden');
  placeholder.style.display = 'none';

  noteTitle.value = note.title;
  noteBody.value = note.body;
  updateCharCount();
  lastSaved.textContent = `Saved ${formatDate(note.updatedAt)}`;
  renderList(searchInput.value);
}

function createNote() {
  const note = {
    id: Date.now(),
    title: '',
    body: '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  notes.unshift(note);
  save();
  renderList();
  openNote(note.id);
  noteTitle.focus();
}

function deleteNote() {
  if (!activeId) return;
  if (!confirm('Delete this note?')) return;
  notes = notes.filter(n => n.id !== activeId);
  activeId = null;
  save();
  editor.classList.add('hidden');
  placeholder.style.display = '';
  renderList();
}

function autoSave() {
  if (!activeId) return;
  const note = notes.find(n => n.id === activeId);
  if (!note) return;

  note.title = noteTitle.value;
  note.body = noteBody.value;
  note.updatedAt = Date.now();
  save();
  lastSaved.textContent = 'Saved just now';
  renderList(searchInput.value);
}

function updateCharCount() {
  charCount.textContent = `${noteBody.value.length} characters`;
}

newNoteBtn.addEventListener('click', createNote);
deleteNoteBtn.addEventListener('click', deleteNote);

[noteTitle, noteBody].forEach(el => {
  el.addEventListener('input', () => {
    updateCharCount();
    clearTimeout(saveTimer);
    saveTimer = setTimeout(autoSave, 600);
  });
});

searchInput.addEventListener('input', () => renderList(searchInput.value));

// Init
renderList();
if (notes.length > 0) openNote(notes[0].id);
