"""
Fake data seeding script for MediGuard
Creates realistic test data with doctor-patient relationships
"""

import random
from datetime import datetime
from faker import Faker
from backend import create_app
from backend.extensions import db, bcrypt
from backend.models.user import User
from backend.models.patient import Patient
from backend.models.condition import Condition
from backend.models.medication import Medication
from backend.models.observation import Observation

fake = Faker()

# Common password for all users
PASSWORD = "111111"

# Medical data templates
CONDITIONS = [
    {"name": "Hypertension", "system": "Cardiovascular", "severity": ["Mild", "Moderate"]},
    {"name": "Type 2 Diabetes", "system": "Endocrine", "severity": ["Moderate", "Severe"]},
    {"name": "Asthma", "system": "Respiratory", "severity": ["Mild", "Moderate", "Severe"]},
    {"name": "Depression", "system": "Nervous", "severity": ["Mild", "Moderate"]},
    {"name": "Arthritis", "system": "Musculoskeletal", "severity": ["Mild", "Moderate", "Severe"]},
    {"name": "COPD", "system": "Respiratory", "severity": ["Moderate", "Severe", "Critical"]},
    {"name": "Coronary Artery Disease", "system": "Cardiovascular", "severity": ["Moderate", "Severe"]},
    {"name": "Anxiety Disorder", "system": "Nervous", "severity": ["Mild", "Moderate"]},
    {"name": "Chronic Back Pain", "system": "Musculoskeletal", "severity": ["Mild", "Moderate", "Severe"]},
    {"name": "Migraine", "system": "Nervous", "severity": ["Mild", "Moderate", "Severe"]},
]

MEDICATIONS = [
    {"name": "Lisinopril 10mg", "purpose": "Blood pressure control"},
    {"name": "Metformin 500mg", "purpose": "Diabetes management"},
    {"name": "Albuterol Inhaler", "purpose": "Asthma symptom relief"},
    {"name": "Sertraline 50mg", "purpose": "Depression treatment"},
    {"name": "Ibuprofen 400mg", "purpose": "Pain relief"},
    {"name": "Atorvastatin 20mg", "purpose": "Cholesterol management"},
    {"name": "Omeprazole 20mg", "purpose": "Acid reflux control"},
    {"name": "Gabapentin 300mg", "purpose": "Nerve pain management"},
    {"name": "Amlodipine 5mg", "purpose": "Blood pressure control"},
    {"name": "Metoprolol 25mg", "purpose": "Heart rate control"},
]

OBSERVATIONS = [
    {"name": "Blood Pressure", "unit": "mmHg", "normal_range": (110, 130, 70, 85)},  # systolic/diastolic
    {"name": "Heart Rate", "unit": "bpm", "normal_range": (60, 100)},
    {"name": "Body Temperature", "unit": "°F", "normal_range": (97.0, 99.0)},
    {"name": "Blood Glucose", "unit": "mg/dL", "normal_range": (70, 140)},
    {"name": "Oxygen Saturation", "unit": "%", "normal_range": (95, 100)},
    {"name": "Body Weight", "unit": "kg", "normal_range": (50, 100)},
    {"name": "Body Height", "unit": "cm", "normal_range": (150, 190)},
    {"name": "BMI", "unit": "kg/m²", "normal_range": (18.5, 25)},
    {"name": "Respiratory Rate", "unit": "breaths/min", "normal_range": (12, 20)},
    {"name": "Cholesterol Total", "unit": "mg/dL", "normal_range": (125, 200)},
]

def create_fake_data():
    app = create_app()
    with app.app_context():
        print("🗑️  Clearing existing data...")
        db.drop_all()
        db.create_all()

        # Hash password once for reuse
        pwd_hash = bcrypt.generate_password_hash(PASSWORD).decode('utf-8')

        # 1. Create Admin
        print("\n👤 Creating admin account...")
        admin = User(
            username="admin",
            email="admin@mediguard.com",
            password_hash=pwd_hash,
            role="Admin"
        )
        db.session.add(admin)

        # 2. Create 6 Doctors
        print("\n👨‍⚕️ Creating doctor accounts...")
        doctors = []
        doctor_names = [
            ("Dr. Robert", "Smith", "Cardiology"),
            ("Dr. Emily", "Johnson", "Internal Medicine"),
            ("Dr. Michael", "Chen", "Family Medicine"),
            ("Dr. Sarah", "Williams", "Pulmonology"),
            ("Dr. David", "Brown", "Endocrinology"),
            ("Dr. Lisa", "Davis", "General Practice"),
        ]

        for first, last, specialty in doctor_names:
            username = f"{first.lower().replace('dr. ', '')}_{last.lower()}"
            doctor = User(
                username=username,
                email=f"{username}@mediguard.com",
                password_hash=pwd_hash,
                role="Doctor"
            )
            db.session.add(doctor)
            doctors.append({
                "user": doctor,
                "name": f"{first} {last}",
                "specialty": specialty
            })
            print(f"  ✓ {first} {last} ({specialty})")

        db.session.flush()  # Get IDs for doctors

        # 3. Create Patients (4-6 per doctor)
        print("\n👥 Creating patient accounts...")
        patient_counter = 0

        for doc_info in doctors:
            doctor = doc_info["user"]
            num_patients = random.randint(4, 6)

            print(f"\n  {doc_info['name']} will have {num_patients} patients:")

            for _ in range(num_patients):
                # Create patient user
                first_name = fake.first_name()
                last_name = fake.last_name()
                username = f"{first_name.lower()}_{last_name.lower()}"

                patient_user = User(
                    username=username,
                    email=f"{username}@example.com",
                    password_hash=pwd_hash,
                    role="Patient"
                )
                db.session.add(patient_user)
                db.session.flush()

                # Create patient record
                dob = fake.date_of_birth(minimum_age=18, maximum_age=85)
                patient = Patient(
                    user_id=patient_user.id,
                    doctor_id=doctor.id,  # Assign to this doctor
                    mrn=f"MRN{patient_counter:06d}",
                    name=f"{first_name} {last_name}",
                    dob=dob,
                    gender=random.choice(["Male", "Female"]),
                    ssn=fake.ssn(),
                    address=fake.address().replace('\n', ', '),
                    phone=fake.phone_number(),
                    email=patient_user.email
                )
                db.session.add(patient)
                db.session.flush()

                print(f"    ✓ {patient.name} (Age: {datetime.now().year - dob.year})")

                # Add 1-3 conditions per patient
                num_conditions = random.randint(1, 3)
                selected_conditions = random.sample(CONDITIONS, num_conditions)
                for cond_template in selected_conditions:
                    condition = Condition(
                        patient_id=patient.id,
                        disease_name=cond_template["name"],
                        severity=random.choice(cond_template["severity"]),
                        status="active" if random.random() > 0.3 else "resolved",
                        diagnosed_date=fake.date_between(start_date="-5y", end_date="today"),
                        body_system=cond_template["system"]
                    )
                    db.session.add(condition)

                # Add 2-5 medications per patient
                num_meds = random.randint(2, 5)
                selected_meds = random.sample(MEDICATIONS, num_meds)
                for med_template in selected_meds:
                    medication = Medication(
                        patient_id=patient.id,
                        medicine_name=med_template["name"],
                        dosage="Take as directed",
                        start_date=fake.date_between(start_date="-2y", end_date="today"),
                        purpose=med_template["purpose"]
                    )
                    db.session.add(medication)

                # Add 5-10 observations per patient
                num_obs = random.randint(5, 10)
                for _ in range(num_obs):
                    obs_template = random.choice(OBSERVATIONS)

                    # Generate realistic values
                    if obs_template["name"] == "Blood Pressure":
                        # Systolic/Diastolic
                        sys_min, sys_max, dia_min, dia_max = obs_template["normal_range"]
                        if random.random() > 0.8:  # 20% abnormal
                            value = f"{random.randint(130, 160)}/{random.randint(85, 100)}"
                            is_normal = False
                        else:
                            value = f"{random.randint(sys_min, sys_max)}/{random.randint(dia_min, dia_max)}"
                            is_normal = True
                    else:
                        min_val, max_val = obs_template["normal_range"]
                        if random.random() > 0.8:  # 20% abnormal
                            # Generate slightly out of range
                            if random.random() > 0.5:
                                value = str(round(random.uniform(max_val, max_val * 1.2), 1))
                            else:
                                value = str(round(random.uniform(min_val * 0.8, min_val), 1))
                            is_normal = False
                        else:
                            value = str(round(random.uniform(min_val, max_val), 1))
                            is_normal = True

                    observation = Observation(
                        patient_id=patient.id,
                        test_name=obs_template["name"],
                        value=value,
                        unit=obs_template["unit"],
                        is_normal=is_normal,
                        test_date=fake.date_between(start_date="-1y", end_date="today")
                    )
                    db.session.add(observation)

                patient_counter += 1

        # Commit all changes
        db.session.commit()

        print("\n" + "="*60)
        print("✅ Database seeding completed successfully!")
        print("="*60)
        print("\n📊 Summary:")
        print(f"  • 1 Admin")
        print(f"  • {len(doctors)} Doctors")
        print(f"  • {patient_counter} Patients")

        print("\n🔐 Login Credentials (Password for all: 111111):")
        print("\n  Admin:")
        print("    • Username: admin")

        print("\n  Doctors:")
        for doc_info in doctors:
            print(f"    • Username: {doc_info['user'].username} ({doc_info['specialty']})")

        print("\n  Patients:")
        print("    • All patient usernames follow pattern: firstname_lastname")
        print("    • Check the database for specific usernames")

        print("\n💡 Access Control:")
        print("  • Admin can see all data")
        print("  • Doctors can only see their assigned patients")
        print("  • Patients can only see their own data")
        print("="*60)

if __name__ == "__main__":
    create_fake_data()