import React from "react";
import styles from "./CourseCard.module.css";
import Image from "next/image";

interface CourseCardProps {
  image?: string;
  title: string;
  category?: string;
  description: string;
  href: string;
}

const CourseCard = ({
  image,
  title,
  category,
  description,
  // href,
}: CourseCardProps) => {
  return (
    <div className={styles.courseCard}>
      <div className={styles.imageContainer}>
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className={styles.cardImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <h3 className={styles.cardTitle}>{title}</h3>
          </div>
        )}
      </div>
      <div className={styles.cardBody}>
        {image && <h3 className={styles.cardTitle}>{title}</h3>}
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={styles.cardFooter}>
        {category && <span className={styles.category}>{category}</span>}
        <button className={styles.cardButton}>View Course</button>
      </div>
    </div>
  );
};

export default CourseCard;
