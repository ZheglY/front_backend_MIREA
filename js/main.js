document.documentElement.classList.add('js');
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');toggle.hidden=false;
function closeMenu(){nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}
toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();toggle.focus()}});
matchMedia('(min-width:640px)').addEventListener('change',closeMenu);
document.querySelector('.filters')?.addEventListener('submit',e=>{e.preventDefault();const category=document.querySelector('#category').value;let count=0;document.querySelectorAll('.card').forEach(card=>{card.hidden=category!=='all'&&card.dataset.category!==category;if(!card.hidden)count++});document.querySelector('#filter-status').textContent='Блюд: '+count});
const dishes={pizza:['Маргарита','Томаты, моцарелла, свежий базилик',690,'400 г','Глютен, молоко'],pasta:['Паста песто','Паста, базилик, пармезан, кедровые орехи',790,'300 г','Глютен, молоко, орехи'],dessert:['Тирамису','Маскарпоне, эспрессо, савоярди, какао',490,'150 г','Глютен, молоко, яйца']};
if(document.querySelector('#dish-title')){let id=new URLSearchParams(location.search).get('id');if(!Object.hasOwn(dishes,id))id='pizza';const d=dishes[id];['title','description','price','weight','allergens'].forEach((key,i)=>document.querySelector('#dish-'+key).textContent=d[i]+(key==='price'?' ₽':''));const img=document.querySelector('#dish-image img');img.src='images/'+id+'-960.webp';img.srcset=`images/${id}-480.webp 480w, images/${id}-960.webp 960w`;img.alt=d[0];document.title=d[0]+' — Casa di Sole'}
const date=document.querySelector('#date');if(date){const now=new Date();date.min=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-')}
document.querySelectorAll('.contact-form').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();form.querySelector('.form-status').textContent='Данные заполнены корректно. Учебная демонстрация: ничего не отправлено.'}));
