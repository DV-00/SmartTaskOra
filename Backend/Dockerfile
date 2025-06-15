# Use a base image with OpenJDK 17 (or your project's Java version)
FROM openjdk:17-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml and src folder into the container
# This copies only what's necessary for the build first
COPY pom.xml .
COPY src ./src

# Build the Spring Boot application using Maven
# The -DskipTests is crucial to avoid running tests during the build
RUN mvn clean package -DskipTests

# Expose the port that your Spring Boot application will run on
# This should match your server.port in application.properties (8080)
EXPOSE 8080

# Command to run your Spring Boot application
# Replace 'smarttasker-0.0.1-SNAPSHOT.jar' with your actual JAR file name
CMD ["java", "-jar", "target/smarttasker-0.0.1-SNAPSHOT.jar"]