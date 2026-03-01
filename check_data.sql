-- Check if cantieri table has data
select count(*) as numero_cantieri from cantieri;

-- Check if dipendenti table has data
select count(*) as numero_dipendenti from dipendenti;

-- List first 5 cantieri to verify content
select * from cantieri limit 5;

-- List first 5 dipendenti to verify content
select * from dipendenti limit 5;

-- Check if RLS is enabled on cantieri
select relname, relrowsecurity 
from pg_class 
where relname = 'cantieri';

-- Check if RLS is enabled on dipendenti
select relname, relrowsecurity 
from pg_class 
where relname = 'dipendenti';
