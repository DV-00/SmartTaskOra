# --- BUILD STAGE ---
# Use a Maven image as the builder
FROM maven:3.8.5-openjdk-17 AS builder

# Set the working directory inside the builder container
WORKDIR /app

# Copy the pom.xml and src folder into the builder container
# This caches dependencies better if only pom.xml changes
COPY pom.xml .
COPY src ./src

# Build the Spring Boot application using Maven
# The -DskipTests is crucial to avoid running tests during the build
RUN mvn clean package -DskipTests

# --- RUNTIME STAGE ---
# Use a lightweight OpenJDK image for the final application
FROM openjdk:17-jdk-slim

# Set the working directory inside the final container
WORKDIR /app

# Copy the built JAR file from the builder stage to the current stage
# Replace 'smarttasker-0.0.1-SNAPSHOT.jar' with your actual JAR file name
COPY --from=builder /app/target/smarttasker-0.0.1-SNAPSHOT.jar ./smarttasker-0.0.1-SNAPSHOT.jar

# Expose the port that your Spring Boot application will run on
EXPOSE 8080

# Command to run your Spring Boot application
CMD ["java", "-jar", "smarttasker-0.0.1-SNAPSHOT.jar"]