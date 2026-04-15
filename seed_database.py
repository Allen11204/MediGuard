import os
import json
import glob
import random
from datetime import datetime
from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User
from app.models.patient import Patient
from app.models.condition import Condition
from app.models.medication import Medication
from app.models.observation import Observation

def parse_date(date_str):
    if not date_str:
        return None
    # FHIR dates can be "YYYY-MM-DD" or "YYYY-MM-DDThh:mm:ss+zz:zz"
    try:
        return datetime.strptime(date_str[:10], '%Y-%m-%d').date()
    except ValueError:
        return None

def seed_fhir_data():
    app = create_app()
    with app.app_context():
        # Clear existing data for a clean seed
        print("Clearing existing data and recreating tables...")
        db.drop_all()
        db.create_all()

        # 1. Create Base Users (Admin & Doctor)
        print("Creating admin and doctor users...")
        admin = User(
            username="admin", 
            password_hash=bcrypt.generate_password_hash("admin123").decode('utf-8'),
            role="Admin"
        )
        doctor = User(
            username="doctor", 
            password_hash=bcrypt.generate_password_hash("doctor123").decode('utf-8'),
            role="Doctor"
        )
        db.session.add_all([admin, doctor])
        db.session.commit()

        # 2. Iterate over FHIR files
        fhir_dir = os.path.join(os.path.dirname(__file__), 'data', 'fhir')
        files = glob.glob(os.path.join(fhir_dir, '*.json'))
        
        # limit to a few files for POC speed, say 10 (keeps the DB ultra-focused)
        print(f"Found {len(files)} FHIR files. Seeding ALL records... (This might take a moment)")
        
        # Optimized Hash to vastly improve bulk ingestion speed
        patient_pwd_hash = bcrypt.generate_password_hash("patient123").decode('utf-8')
        
        count = 0
        for filepath in files:
            # Skip hospital info or non-patient bundles
            if 'hospitalInformation' in filepath:
                continue

            with open(filepath, 'r', encoding='utf-8') as f:
                try:
                    bundle = json.load(f)
                except json.JSONDecodeError:
                    continue
            
            if bundle.get('resourceType') != 'Bundle':
                continue
                
            patient_resource = None
            conditions_data = []
            medications_data = []
            observations_data = []
            
            for entry in bundle.get('entry', []):
                resource = entry.get('resource', {})
                rt = resource.get('resourceType')
                
                if rt == 'Patient':
                    patient_resource = resource
                elif rt == 'Condition':
                    conditions_data.append(resource)
                elif rt == 'MedicationRequest':
                    medications_data.append(resource)
                elif rt == 'Observation':
                    observations_data.append(resource)

            if not patient_resource:
                continue

            # Extract Patient Info
            mrn = patient_resource.get('id', 'UNKNOWN')
            
            # Name
            name_list = patient_resource.get('name', [{}])[0]
            given = " ".join(name_list.get('given', []))
            family = name_list.get('family', '')
            full_name = f"{given} {family}".strip()
            
            # DOB & Gender
            dob_str = patient_resource.get('birthDate', '1970-01-01')
            gender = patient_resource.get('gender', 'unknown')
            
            # Contact
            telecom = patient_resource.get('telecom', [])
            phone = next((t.get('value') for t in telecom if t.get('system') == 'phone'), '000-000-0000')
            
            # Address
            address_list = patient_resource.get('address', [{}])
            if address_list:
                line = " ".join(address_list[0].get('line', []))
                city = address_list[0].get('city', '')
                state = address_list[0].get('state', '')
                zipcode = address_list[0].get('postalCode', '')
                full_address = f"{line}, {city}, {state} {zipcode}".strip()
            else:
                full_address = "Unknown Address"
            
            # SSN
            identifiers = patient_resource.get('identifier', [])
            ssn = next((i.get('value') for i in identifiers if i.get('system') == 'http://hl7.org/fhir/sid/us-ssn'), '000-00-0000')

            # Create User for Patient
            # Lowercase and clean username (e.g. jenice416_oconner)
            clean_given = given.split(' ')[0].lower() if given else 'patient'
            clean_family = family.replace("'", "").lower() if family else str(count)
            username = f"{clean_given}_{clean_family}"
            
            patient_user = User(
                username=username,
                password_hash=patient_pwd_hash, # Use optimized hash
                role="Patient"
            )
            db.session.add(patient_user)
            db.session.flush() # flush to get patient_user.id
            
            # Create Patient model
            patient = Patient(
                user_id=patient_user.id,
                mrn=mrn,
                name=full_name,
                dob=parse_date(dob_str),
                gender=gender,
                ssn=ssn,
                address=full_address,
                phone=phone,
                email=f"{username}@example.com"
            )
            db.session.add(patient)
            db.session.flush()

            # Create Conditions
            for c in conditions_data:
                code_text = c.get('code', {}).get('text')
                if not code_text:
                    coding = c.get('code', {}).get('coding', [])
                    code_text = coding[0].get('display', 'Unknown') if coding else 'Unknown'
                    
                clin_status = c.get('clinicalStatus', {}).get('coding', [{}])[0].get('code', 'active')
                onset = c.get('onsetDateTime', '2000-01-01')
                
                cond = Condition(
                    patient_id=patient.id,
                    disease_name=code_text[:100],
                    severity=random.choice(["Mild", "Moderate", "Severe", "Critical", "Unknown"]), # Random assignment
                    status=clin_status,
                    diagnosed_date=parse_date(onset),
                    body_system=random.choice(["Cardiovascular", "Respiratory", "Digestive", "Nervous", "Endocrine", "General Systemic", "Musculoskeletal", "Immune"]) # Random assignment
                )
                db.session.add(cond)
                
            # Create Medications
            for m in medications_data:
                med_name = m.get('medicationCodeableConcept', {}).get('text')
                if not med_name:
                    coding = m.get('medicationCodeableConcept', {}).get('coding', [])
                    med_name = coding[0].get('display', 'Unknown') if coding else 'Unknown'
                
                start = m.get('authoredOn', '2000-01-01')
                dosage = "As directed by physician"
                if m.get('dosageInstruction'):
                    dosage = m.get('dosageInstruction')[0].get('text', dosage)
                    
                purpose = random.choice(["Symptom management", "Pain relief", "Reduce inflammation", "Infection control", "Preventative care", "Lower blood pressure"])
                reason = m.get('reasonCode', [])
                if reason:
                    purpose = reason[0].get('text', purpose)
                
                med = Medication(
                    patient_id=patient.id,
                    medicine_name=med_name[:200],
                    dosage=dosage[:100],
                    start_date=parse_date(start) or datetime.utcnow().date(),
                    purpose=purpose[:200]
                )
                db.session.add(med)
                
            # Create Observations
            for o in observations_data:
                code_text = o.get('code', {}).get('text')
                if not code_text:
                    coding = o.get('code', {}).get('coding', [])
                    code_text = coding[0].get('display', 'Unknown') if coding else 'Unknown'
                
                eff_date = o.get('effectiveDateTime', '2000-01-01')
                
                value = '0'
                unit = ''
                if 'valueQuantity' in o:
                    value = str(o['valueQuantity'].get('value', '0'))
                    unit = o['valueQuantity'].get('unit', '')
                elif 'component' in o:
                    # E.g. blood pressure parsing (diastolic/systolic)
                    comps = []
                    for comp in o['component']:
                        cv = comp.get('valueQuantity', {}).get('value', '')
                        comps.append(str(cv))
                    value = "/".join(comps)
                    unit = o['component'][0].get('valueQuantity', {}).get('unit', '') if o['component'] else ''
                
                obs = Observation(
                    patient_id=patient.id,
                    test_name=code_text[:100],
                    value=value[:50],
                    unit=unit[:20],
                    is_normal=random.choice([True, True, True, True, False]), # Random (80% Normal, 20% Abnormal)
                    test_date=parse_date(eff_date) or datetime.utcnow().date()
                )
                db.session.add(obs)
                
            count += 1
            db.session.commit()
            if count % 10 == 0:
                print(f"Seeded {count} patients so far...")

    print(f"\n✅ Database seeding successfully completed! Total seeded: {count}")
    print("--------------------------------------------------")
    print("Test Accounts Available:")
    print("1. Admin  | User: admin   | Pass: admin123")
    print("2. Doctor | User: doctor  | Pass: doctor123") 
    print("3. Each seeded patient also has a login shown above.")

if __name__ == "__main__":
    seed_fhir_data()
